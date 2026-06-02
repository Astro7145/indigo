/** @jest-environment node */
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/signup/route';
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
  return new NextRequest('http://localhost/api/auth/signup', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

it('upstream 201을 200으로 정규화하고 쿠키를 설정한 뒤 { user }를 반환한다', async () => {
  queueAdapter([
    {
      status: 201,
      body: JSON.stringify({
        accessToken: 'AA',
        refreshToken: 'RR',
        user: { id: 2, email: 's@b.c', name: 's', image: null },
      }),
    },
  ]);
  const res = await POST(req({ email: 's@b.c', name: 's', password: 'pw' }));
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ user: { id: 2, email: 's@b.c', name: 's', image: null } });
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('AA');
});
