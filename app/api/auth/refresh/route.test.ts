/** @jest-environment node */
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/refresh/route';
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

function req(cookie?: string) {
  return new NextRequest('http://localhost/api/auth/refresh', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
  });
}

it('쿠키를 갱신하고 204를 반환한다', async () => {
  queueAdapter([{ status: 200, body: JSON.stringify({ accessToken: 'NA', refreshToken: 'NR' }) }]);
  const res = await POST(req(`${COOKIE.REFRESH}=OLD`));
  expect(res.status).toBe(204);
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('NA');
});

it('refresh 쿠키 없음 → 401 + 쿠키 삭제', async () => {
  const res = await POST(req());
  expect(res.status).toBe(401);
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('');
});
