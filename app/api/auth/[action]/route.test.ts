/** @jest-environment node */
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/[action]/route';
import { COOKIE, backendHttp } from '@/src/api/server/bff';
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
function rejectingAdapter(err: Error) {
  const calls: Parameters<AxiosAdapter>[0][] = [];
  backendHttp.defaults.adapter = (async (config) => {
    calls.push(config);
    throw err;
  }) as AxiosAdapter;
  return calls;
}
afterEach(() => {
  delete (backendHttp.defaults as { adapter?: unknown }).adapter;
});

function req(action: string, body?: unknown, cookie?: string) {
  return new NextRequest(`http://localhost/api/auth/${action}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
const ctx = (action: string) => ({ params: Promise.resolve({ action }) });

it('login: 쿠키를 설정하고 토큰을 제거한 뒤 { user }를 반환한다', async () => {
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
  const res = await POST(req('login', { email: 'a@b.c', password: 'pw' }), ctx('login'));
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ user: { id: 1, email: 'a@b.c', name: 'n', image: null } });
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('AA');
  expect(res.cookies.get(COOKIE.REFRESH)?.value).toBe('RR');
});

it('login: 외부 에러를 그대로 전달한다', async () => {
  queueAdapter([{ status: 401, body: JSON.stringify({ message: 'Invalid email or password' }) }]);
  const res = await POST(req('login', { email: 'x', password: 'y' }), ctx('login'));
  expect(res.status).toBe(401);
  expect(await res.json()).toEqual({ message: 'Invalid email or password' });
  expect(res.cookies.get(COOKIE.ACCESS)).toBeUndefined();
});

it('signup: 쿠키를 설정하고 { user }를 반환한다', async () => {
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
  const res = await POST(req('signup', { email: 's@b.c', name: 's', password: 'pw' }), ctx('signup'));
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ user: { id: 2, email: 's@b.c', name: 's', image: null } });
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('AA');
});

it('login: 잘못된 형식의 2xx 본문 → 502', async () => {
  queueAdapter([{ status: 200, body: '<html>not json</html>' }]);
  const res = await POST(req('login', { email: 'a@b.c', password: 'pw' }), ctx('login'));
  expect(res.status).toBe(502);
});

it('login 에러 전달 시 content-type을 유지한다', async () => {
  queueAdapter([{ status: 401, body: JSON.stringify({ message: 'nope' }), contentType: 'application/json' }]);
  const res = await POST(req('login', { email: 'x', password: 'y' }), ctx('login'));
  expect(res.status).toBe(401);
  expect(res.headers.get('content-type')).toBe('application/json');
});

it('refresh 쿠키 없는 logout → 204 + 쿠키 삭제, 상위 호출 없음', async () => {
  const calls = queueAdapter([{ status: 200, body: '{}' }]);
  const res = await POST(req('logout'), ctx('logout'));
  expect(res.status).toBe(204);
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('');
  expect(calls.length).toBe(0);
});

it('상위 호출이 실패해도 logout은 쿠키를 삭제한다', async () => {
  rejectingAdapter(new Error('network down'));
  const res = await POST(req('logout', undefined, `${COOKIE.REFRESH}=OLD`), ctx('logout'));
  expect(res.status).toBe(204);
  expect(res.cookies.get(COOKIE.REFRESH)?.value).toBe('');
});

it('refresh: 쿠키를 갱신하고 204를 반환한다', async () => {
  queueAdapter([{ status: 200, body: JSON.stringify({ accessToken: 'NA', refreshToken: 'NR' }) }]);
  const res = await POST(req('refresh', undefined, `${COOKIE.REFRESH}=OLD`), ctx('refresh'));
  expect(res.status).toBe(204);
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('NA');
});

it('refresh: refresh 쿠키 없음 → 401 + 쿠키 삭제', async () => {
  const res = await POST(req('refresh'), ctx('refresh'));
  expect(res.status).toBe(401);
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('');
});

it('logout: 쿠키를 삭제하고 204를 반환한다 (best effort)', async () => {
  queueAdapter([{ status: 200, body: '{}' }]);
  const res = await POST(req('logout', undefined, `${COOKIE.REFRESH}=OLD`), ctx('logout'));
  expect(res.status).toBe(204);
  expect(res.cookies.get(COOKIE.REFRESH)?.value).toBe('');
});

it('알 수 없는 action → 404', async () => {
  const res = await POST(req('bogus'), ctx('bogus'));
  expect(res.status).toBe(404);
});
