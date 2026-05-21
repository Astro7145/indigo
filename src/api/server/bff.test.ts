/** @jest-environment node */
import { NextResponse } from 'next/server';
import {
  externalBase,
  parseAuthCookies,
  setAuthCookies,
  clearAuthCookies,
  callExternal,
  refreshTokens,
  passthrough,
  backendHttp,
  COOKIE,
  assertSafePath,
} from '@/src/api/server/bff';
import { AxiosHeaders, type AxiosAdapter } from 'axios';

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

beforeEach(() => {
  process.env.BACKEND_API_BASE_URL = 'https://api.test';
  process.env.BACKEND_TEAM_ID = 'indigo';
  jest.restoreAllMocks();
});

describe('externalBase', () => {
  it('base와 teamId를 결합한다', () => {
    expect(externalBase()).toBe('https://api.test/indigo');
  });
  it('env가 없으면 예외를 던진다', () => {
    delete process.env.BACKEND_TEAM_ID;
    expect(() => externalBase()).toThrow(/BACKEND_TEAM_ID/);
  });
  it('BACKEND_API_BASE_URL이 없으면 예외를 던진다', () => {
    delete process.env.BACKEND_API_BASE_URL;
    expect(() => externalBase()).toThrow(/BACKEND_API_BASE_URL/);
  });
  it('슬래시를 정규화한다(이중 슬래시 없음)', () => {
    process.env.BACKEND_API_BASE_URL = 'https://api.test/';
    process.env.BACKEND_TEAM_ID = '/indigo/';
    expect(externalBase()).toBe('https://api.test/indigo');
  });
});

describe('cookies', () => {
  it('parseAuthCookies는 request 유사 객체에서 두 토큰을 읽는다', () => {
    const req = {
      cookies: {
        get: (n: string) => (n === COOKIE.ACCESS ? { value: 'a' } : n === COOKIE.REFRESH ? { value: 'r' } : undefined),
      },
    };
    expect(parseAuthCookies(req as never)).toEqual({ access: 'a', refresh: 'r' });
  });
  it('setAuthCookies는 httpOnly access + refresh를 설정한다', () => {
    const res = NextResponse.json(null);
    setAuthCookies(res, { accessToken: 'AA', refreshToken: 'RR' });
    expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('AA');
    expect(res.cookies.get(COOKIE.REFRESH)?.value).toBe('RR');
    // access는 세션 스코프(maxAge 없음), refresh는 7일(실제 토큰 TTL에 정렬)
    expect(res.cookies.get(COOKIE.ACCESS)?.maxAge).toBeUndefined();
    expect(res.cookies.get(COOKIE.REFRESH)?.maxAge).toBe(60 * 60 * 24 * 7);
  });
  it('clearAuthCookies는 두 쿠키를 만료시킨다', () => {
    const res = NextResponse.json(null);
    setAuthCookies(res, { accessToken: 'AA', refreshToken: 'RR' });
    clearAuthCookies(res);
    expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('');
    expect(res.cookies.get(COOKIE.REFRESH)?.value).toBe('');
    expect(res.cookies.get(COOKIE.ACCESS)?.maxAge).toBe(0);
    expect(res.cookies.get(COOKIE.REFRESH)?.maxAge).toBe(0);
  });
});

describe('assertSafePath', () => {
  it('.. / . / 빈 세그먼트에 대해 예외를 던진다', () => {
    expect(() => assertSafePath('a/../b')).toThrow(/Unsafe path/);
    expect(() => assertSafePath('a//b')).toThrow(/Unsafe path/);
    expect(() => assertSafePath('a/./b')).toThrow(/Unsafe path/);
  });
  it('정상적인 도메인 경로는 허용한다', () => {
    expect(() => assertSafePath('todos')).not.toThrow();
    expect(() => assertSafePath('posts/2/comments/8/likes')).not.toThrow();
    expect(() => assertSafePath('users/check-nickname')).not.toThrow();
  });
});

describe('callExternal', () => {
  it('URL, method, Bearer를 구성하고 status+body를 반환한다', async () => {
    const calls = queueAdapter([{ status: 200, body: JSON.stringify({ ok: true }), contentType: 'application/json' }]);
    const r = await callExternal({ method: 'GET', path: 'goals', search: '?limit=1', accessToken: 'TK' });
    expect(calls[0].url).toBe('https://api.test/indigo/goals?limit=1');
    expect(String(calls[0].method).toUpperCase()).toBe('GET');
    expect(AxiosHeaders.from(calls[0].headers as never).get('Authorization')).toBe('Bearer TK');
    expect(r.status).toBe(200);
    expect(JSON.parse(r.body)).toEqual({ ok: true });
    expect(r.contentType).toBe('application/json');
  });
  it('토큰이 없으면 Authorization을 생략하고 body를 전달한다', async () => {
    const calls = queueAdapter([{ status: 200, body: '{}' }]);
    await callExternal({ method: 'POST', path: 'auth/login', body: '{"x":1}', contentType: 'application/json' });
    expect(AxiosHeaders.from(calls[0].headers as never).has('Authorization')).toBe(false);
    expect(calls[0].data).toBe('{"x":1}');
  });
  it('요청 전에 traversal 경로를 거부한다', async () => {
    const calls = queueAdapter([{ status: 200, body: '{}' }]);
    await expect(callExternal({ method: 'GET', path: '../secret' })).rejects.toThrow(/Unsafe path/);
    expect(calls.length).toBe(0);
  });
  it('nullish 응답 본문을 빈 문자열로 정규화한다(\'""\'가 아님)', async () => {
    backendHttp.defaults.adapter = (async (config) => ({
      data: undefined,
      status: 200,
      statusText: '',
      headers: {},
      config,
    })) as import('axios').AxiosAdapter;
    const r = await callExternal({ method: 'GET', path: 'x' });
    expect(r.body).toBe('');
  });
  it('search에 ?가 없으면 앞에 붙인다', async () => {
    const calls = queueAdapter([{ status: 200, body: '{}' }]);
    await callExternal({ method: 'GET', path: 'todos', search: 'limit=1' });
    expect(calls[0].url).toBe('https://api.test/indigo/todos?limit=1');
  });
  it('이미 ?가 있으면 search를 그대로 둔다', async () => {
    const calls = queueAdapter([{ status: 200, body: '{}' }]);
    await callExternal({ method: 'GET', path: 'todos', search: '?limit=2' });
    expect(calls[0].url).toBe('https://api.test/indigo/todos?limit=2');
  });
});

describe('refreshTokens', () => {
  it('성공 시 갱신된 토큰을 반환하고 refresh 토큰을 전송한다', async () => {
    const calls = queueAdapter([{ status: 200, body: JSON.stringify({ accessToken: 'NA', refreshToken: 'NR' }) }]);
    expect(await refreshTokens('OLD')).toEqual({ accessToken: 'NA', refreshToken: 'NR' });
    expect(JSON.parse(calls[0].data as string)).toEqual({ refreshToken: 'OLD' });
  });
  it('실패 시 null을 반환한다', async () => {
    queueAdapter([{ status: 401, body: '{}' }]);
    expect(await refreshTokens('OLD')).toBeNull();
  });
});

describe('passthrough', () => {
  it('204 → 본문 없는 NextResponse 204(예외 없음)', () => {
    const res = passthrough({ status: 204, body: '', contentType: null });
    expect(res.status).toBe(204);
  });
  it('200 → body + content-type 유지', async () => {
    const res = passthrough({ status: 200, body: '{"a":1}', contentType: 'application/json' });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/json');
    expect(await res.text()).toBe('{"a":1}');
  });
  it('304 → 본문 없음(예외 없음)', () => {
    expect(passthrough({ status: 304, body: '', contentType: null }).status).toBe(304);
  });
});
