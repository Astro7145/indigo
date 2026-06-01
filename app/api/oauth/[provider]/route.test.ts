/** @jest-environment node */
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/oauth/[provider]/route';
import { COOKIE, backendHttp } from '@/src/api/server/server-fetcher';
import { type AxiosAdapter } from 'axios';
import { getServerSession } from 'next-auth';

jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(),
  getServerSession: jest.fn(),
}));

const mockGetServerSession = getServerSession as jest.Mock;

beforeEach(() => {
  process.env.BACKEND_API_BASE_URL = 'https://api.test';
  process.env.BACKEND_TEAM_ID = 'indigo';
  process.env.NEXTAUTH_URL = 'http://localhost:3000';
  jest.restoreAllMocks();
});

type MockResp = { status: number; body?: string; contentType?: string };
function queueAdapter(responses: MockResp[]) {
  const calls: Parameters<AxiosAdapter>[0][] = [];
  let i = 0;
  backendHttp.defaults.adapter = (async (config) => {
    calls.push(config);
    const r = responses[Math.min(i, responses.length - 1)];
    i += 1;
    return {
      data: r.body ?? '',
      status: r.status,
      statusText: '',
      headers: r.contentType ? { 'content-type': r.contentType } : {},
      config,
    };
  }) as AxiosAdapter;
  return calls;
}

afterEach(() => {
  delete (backendHttp.defaults as { adapter?: unknown }).adapter;
});

const ctx = (provider: string) => ({ params: Promise.resolve({ provider }) });
function req(provider: string) {
  return new NextRequest(`http://localhost:3000/api/oauth/${provider}`, {
    method: 'GET',
  });
}

it('oauth: 세션 없음 → /login으로 리다이렉트', async () => {
  mockGetServerSession.mockResolvedValue(null);
  const res = await GET(req('google'), ctx('google'));
  expect(res.status).toBe(307);
  expect(res.headers.get('location')).toBe('http://localhost:3000/login');
  expect(res.cookies.get(COOKIE.ACCESS)).toBeUndefined();
});

it('oauth: 토큰을 교환하고 쿠키를 설정한 뒤 /로 리다이렉트한다', async () => {
  mockGetServerSession.mockResolvedValue({ accessToken: 'gtok' });
  const calls = queueAdapter([
    {
      status: 200,
      body: JSON.stringify({
        accessToken: 'AA',
        refreshToken: 'RR',
        user: { id: 9, email: 'g@b.c', name: 'G', image: null },
      }),
    },
  ]);
  const res = await GET(req('google'), ctx('google'));
  expect(calls[0].url).toBe('https://api.test/indigo/oauth/google');
  expect(res.status).toBe(307);
  expect(res.headers.get('location')).toBe('http://localhost:3000/');
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('AA');
  expect(res.cookies.get(COOKIE.REFRESH)?.value).toBe('RR');
});

it('oauth: 외부 에러를 그대로 전달한다', async () => {
  mockGetServerSession.mockResolvedValue({ accessToken: 'gtok' });
  queueAdapter([{ status: 401, body: JSON.stringify({ message: 'bad token' }) }]);
  const res = await GET(req('google'), ctx('google'));
  expect(res.status).toBe(401);
  expect(res.cookies.get(COOKIE.ACCESS)).toBeUndefined();
});

it('oauth: 잘못된 형식의 2xx 본문 → /login?error=parse로 리다이렉트', async () => {
  mockGetServerSession.mockResolvedValue({ accessToken: 'gtok' });
  queueAdapter([{ status: 200, body: '<html>nope</html>' }]);
  const res = await GET(req('google'), ctx('google'));
  expect(res.status).toBe(307);
  expect(res.headers.get('location')).toBe('http://localhost:3000/login?error=parse');
});
