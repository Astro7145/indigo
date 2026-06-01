/** @jest-environment node */
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/login/route';
import { COOKIE, backendHttp } from '@/src/api/server/server-fetcher';
import { type AxiosAdapter } from 'axios';

beforeEach(() => {
  process.env.BACKEND_API_BASE_URL = 'https://api.test';
  process.env.BACKEND_TEAM_ID = 'indigo';
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

function req(body?: unknown, cookie?: string) {
  return new NextRequest('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

it('쿠키를 설정하고 토큰을 제거한 뒤 { user }를 반환한다', async () => {
  queueAdapter([
    {
      status: 200,
      body: JSON.stringify({
        accessToken: 'AA',
        refreshToken: 'RR',
        user: { id: 1, email: 'a@b.c', name: 'n', image: null },
      }),
    },
  ]);
  const res = await POST(req({ email: 'a@b.c', password: 'pw' }));
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ user: { id: 1, email: 'a@b.c', name: 'n', image: null } });
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('AA');
  expect(res.cookies.get(COOKIE.REFRESH)?.value).toBe('RR');
});

it('외부 에러를 그대로 전달한다', async () => {
  queueAdapter([{ status: 401, body: JSON.stringify({ message: 'Invalid email or password' }) }]);
  const res = await POST(req({ email: 'x', password: 'y' }));
  expect(res.status).toBe(401);
  expect(await res.json()).toEqual({ message: 'Invalid email or password' });
  expect(res.cookies.get(COOKIE.ACCESS)).toBeUndefined();
});

it('잘못된 형식의 2xx 본문 → 502', async () => {
  queueAdapter([{ status: 200, body: '<html>not json</html>' }]);
  const res = await POST(req({ email: 'a@b.c', password: 'pw' }));
  expect(res.status).toBe(502);
});

it('에러 전달 시 content-type을 유지한다', async () => {
  queueAdapter([{ status: 401, body: JSON.stringify({ message: 'nope' }), contentType: 'application/json' }]);
  const res = await POST(req({ email: 'x', password: 'y' }));
  expect(res.status).toBe(401);
  expect(res.headers.get('content-type')).toBe('application/json');
});
