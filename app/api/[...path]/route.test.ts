/** @jest-environment node */
import { NextRequest } from 'next/server';
import { GET, POST, PATCH, DELETE } from '@/app/api/[...path]/route';
import { COOKIE, backendHttp } from '@/src/api/server/server-fetcher';
import { AxiosHeaders, type AxiosAdapter } from 'axios';

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

const ctx = (path: string[]) => ({ params: Promise.resolve({ path }) });
function r(url: string, method: string, cookie?: string, body?: string) {
  return new NextRequest(`http://localhost${url}`, {
    method,
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
    body,
  });
}

it('Bearer + query와 함께 GET을 전달하고 body/status를 그대로 통과시킨다', async () => {
  const calls = queueAdapter([{ status: 200, body: JSON.stringify({ goals: [] }), contentType: 'application/json' }]);
  const res = await GET(r('/api/goals?limit=2', 'GET', `${COOKIE.ACCESS}=TK`), ctx(['goals']));
  expect(calls[0].url).toBe('https://api.test/indigo/goals?limit=2');
  expect(AxiosHeaders.from(calls[0].headers as never).get('Authorization')).toBe('Bearer TK');
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ goals: [] });
});

it('access 쿠키 삭제됨(refresh 유효) → silent refresh → 성공 + 쿠키 갱신', async () => {
  const calls = queueAdapter([
    { status: 200, body: JSON.stringify({ accessToken: 'NA', refreshToken: 'NR' }) },
    { status: 200, body: JSON.stringify({ ok: true }), contentType: 'application/json' },
  ]);
  const res = await GET(r('/api/goals', 'GET', `${COOKIE.REFRESH}=RFR`), ctx(['goals']));
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ ok: true });
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('NA');
  expect(res.cookies.get(COOKIE.REFRESH)?.value).toBe('NR');
  // 삭제된 access로의 첫 호출은 건너뛰고 곧장 refresh → 재시도한다 (총 2회)
  expect(calls.length).toBe(2);
  expect(calls[0].url).toBe('https://api.test/indigo/auth/refresh');
  expect(AxiosHeaders.from(calls[1].headers as never).get('Authorization')).toBe('Bearer NA');
});

it('access·refresh 모두 없음 → 외부 호출 없이 쿠키 정리 + 401', async () => {
  const calls = queueAdapter([{ status: 200, body: '{}' }]);
  const res = await GET(r('/api/goals', 'GET'), ctx(['goals']));
  expect(res.status).toBe(401);
  expect(calls.length).toBe(0);
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('');
  expect(res.cookies.get(COOKIE.REFRESH)?.value).toBe('');
});

it('401 → refresh → 새 토큰으로 재시도 → 성공 + 쿠키 갱신', async () => {
  const calls = queueAdapter([
    { status: 401, body: JSON.stringify({ message: 'unauthorized' }) },
    { status: 200, body: JSON.stringify({ accessToken: 'NA', refreshToken: 'NR' }) },
    { status: 200, body: JSON.stringify({ ok: true }), contentType: 'application/json' },
  ]);
  const res = await GET(r('/api/goals', 'GET', `${COOKIE.ACCESS}=OLD; ${COOKIE.REFRESH}=RFR`), ctx(['goals']));
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ ok: true });
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('NA');
  expect(res.cookies.get(COOKIE.REFRESH)?.value).toBe('NR');
  expect(AxiosHeaders.from(calls[2].headers as never).get('Authorization')).toBe('Bearer NA');
});

it('401 → refresh 실패 → 쿠키 삭제 + 401', async () => {
  queueAdapter([
    { status: 401, body: '{}' },
    { status: 401, body: '{}' },
  ]);
  const res = await GET(r('/api/goals', 'GET', `${COOKIE.ACCESS}=OLD; ${COOKIE.REFRESH}=RFR`), ctx(['goals']));
  expect(res.status).toBe(401);
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('');
  expect(res.cookies.get(COOKIE.REFRESH)?.value).toBe('');
});

it('access는 있지만 refresh 쿠키 없는 401 → 쿠키 삭제 + 401', async () => {
  const calls = queueAdapter([{ status: 401, body: '{}' }]);
  const res = await GET(r('/api/goals', 'GET', `${COOKIE.ACCESS}=OLD`), ctx(['goals']));
  expect(res.status).toBe(401);
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('');
  expect(res.cookies.get(COOKIE.REFRESH)?.value).toBe('');
  expect(calls.length).toBe(1); // no refresh attempt without a refresh cookie
});

it('refresh는 성공했지만 재시도도 401 → 쿠키 갱신 + 401 그대로 전달', async () => {
  queueAdapter([
    { status: 401, body: '{}' },
    { status: 200, body: JSON.stringify({ accessToken: 'NA', refreshToken: 'NR' }) },
    { status: 401, body: JSON.stringify({ message: 'still 401' }) },
  ]);
  const res = await GET(r('/api/goals', 'GET', `${COOKIE.ACCESS}=OLD; ${COOKIE.REFRESH}=RFR`), ctx(['goals']));
  expect(res.status).toBe(401);
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('NA');
  expect(res.cookies.get(COOKIE.REFRESH)?.value).toBe('NR');
});

it('PATCH는 body와 갱신된 경로를 전달한다', async () => {
  const calls = queueAdapter([{ status: 200, body: '{}' }]);
  await PATCH(r('/api/todos/5', 'PATCH', `${COOKIE.ACCESS}=TK`, '{"done":true}'), ctx(['todos', '5']));
  expect(calls[0].url).toBe('https://api.test/indigo/todos/5');
  expect(calls[0].data).toBe('{"done":true}');
});

it('POST는 body와 중첩 경로를 전달한다', async () => {
  const calls = queueAdapter([{ status: 201, body: '{}' }]);
  await POST(
    r('/api/posts/2/comments', 'POST', `${COOKIE.ACCESS}=TK`, '{"content":"hi"}'),
    ctx(['posts', '2', 'comments']),
  );
  expect(calls[0].url).toBe('https://api.test/indigo/posts/2/comments');
  expect(calls[0].data).toBe('{"content":"hi"}');
});

it('PATCH와 DELETE 핸들러를 export한다', () => {
  expect(typeof PATCH).toBe('function');
  expect(typeof DELETE).toBe('function');
});

it('외부 204(DELETE)를 예외 없이 프록시한다', async () => {
  queueAdapter([{ status: 204 }]);
  const res = await DELETE(r('/api/todos/5', 'DELETE', `${COOKIE.ACCESS}=TK`), ctx(['todos', '5']));
  expect(res.status).toBe(204);
});

it('경로 traversal을 외부 호출 없이 400으로 거부한다', async () => {
  const calls = queueAdapter([{ status: 200, body: '{}' }]);
  const res = await GET(r('/api/x', 'GET', `${COOKIE.ACCESS}=TK`), ctx(['..', 'goals']));
  expect(res.status).toBe(400);
  expect(calls.length).toBe(0);
});

it('Swagger에 없는 경로는 외부 호출 없이 403으로 거부한다', async () => {
  const calls = queueAdapter([{ status: 200, body: '{}' }]);
  const res = await GET(r('/api/unknown', 'GET', `${COOKIE.ACCESS}=TK`), ctx(['unknown']));
  expect(res.status).toBe(403);
  expect(calls.length).toBe(0);
});

it('경로는 있지만 Swagger에 없는 메서드(DELETE /todos)는 외부 호출 없이 403으로 거부한다', async () => {
  const calls = queueAdapter([{ status: 200, body: '{}' }]);
  const res = await DELETE(r('/api/todos', 'DELETE', `${COOKIE.ACCESS}=TK`), ctx(['todos']));
  expect(res.status).toBe(403);
  expect(calls.length).toBe(0);
});

it('중첩 동적 경로(POST /posts/{id}/comments/{cid}/likes)는 허용되어 통과한다', async () => {
  const calls = queueAdapter([{ status: 201, body: '{}' }]);
  await POST(
    r('/api/posts/2/comments/9/likes', 'POST', `${COOKIE.ACCESS}=TK`),
    ctx(['posts', '2', 'comments', '9', 'likes']),
  );
  expect(calls[0].url).toBe('https://api.test/indigo/posts/2/comments/9/likes');
});
