/** @jest-environment node */
import { NextResponse } from 'next/server'
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
} from '@/src/api/server/bff'
import { AxiosHeaders, type AxiosAdapter } from 'axios'

type MockResp = { status: number; body?: string; contentType?: string }
function queueAdapter(responses: MockResp[]) {
  const calls: Parameters<AxiosAdapter>[0][] = []
  let i = 0
  backendHttp.defaults.adapter = (async (config) => {
    calls.push(config)
    const r = responses[Math.min(i, responses.length - 1)]
    i += 1
    return {
      data: r.body ?? '',
      status: r.status,
      statusText: '',
      headers: r.contentType ? { 'content-type': r.contentType } : {},
      config,
    }
  }) as AxiosAdapter
  return calls
}
afterEach(() => {
  delete (backendHttp.defaults as { adapter?: unknown }).adapter
})

beforeEach(() => {
  process.env.BACKEND_API_BASE_URL = 'https://api.test'
  process.env.BACKEND_TEAM_ID = 'indigo'
  jest.restoreAllMocks()
})

describe('externalBase', () => {
  it('joins base and teamId', () => {
    expect(externalBase()).toBe('https://api.test/indigo')
  })
  it('throws when env missing', () => {
    delete process.env.BACKEND_TEAM_ID
    expect(() => externalBase()).toThrow(/BACKEND_TEAM_ID/)
  })
  it('throws when BACKEND_API_BASE_URL missing', () => {
    delete process.env.BACKEND_API_BASE_URL
    expect(() => externalBase()).toThrow(/BACKEND_API_BASE_URL/)
  })
  it('normalizes slashes (no double slash)', () => {
    process.env.BACKEND_API_BASE_URL = 'https://api.test/'
    process.env.BACKEND_TEAM_ID = '/indigo/'
    expect(externalBase()).toBe('https://api.test/indigo')
  })
})

describe('cookies', () => {
  it('parseAuthCookies reads both tokens from a request-like object', () => {
    const req = { cookies: { get: (n: string) => (n === COOKIE.ACCESS ? { value: 'a' } : n === COOKIE.REFRESH ? { value: 'r' } : undefined) } }
    expect(parseAuthCookies(req as never)).toEqual({ access: 'a', refresh: 'r' })
  })
  it('setAuthCookies sets httpOnly access + refresh', () => {
    const res = NextResponse.json(null)
    setAuthCookies(res, { accessToken: 'AA', refreshToken: 'RR' })
    expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('AA')
    expect(res.cookies.get(COOKIE.REFRESH)?.value).toBe('RR')
  })
  it('clearAuthCookies expires both', () => {
    const res = NextResponse.json(null)
    setAuthCookies(res, { accessToken: 'AA', refreshToken: 'RR' })
    clearAuthCookies(res)
    expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('')
    expect(res.cookies.get(COOKIE.REFRESH)?.value).toBe('')
    expect(res.cookies.get(COOKIE.ACCESS)?.maxAge).toBe(0)
    expect(res.cookies.get(COOKIE.REFRESH)?.maxAge).toBe(0)
  })
})

describe('assertSafePath', () => {
  it('throws on .. / . / empty segment', () => {
    expect(() => assertSafePath('a/../b')).toThrow(/Unsafe path/)
    expect(() => assertSafePath('a//b')).toThrow(/Unsafe path/)
    expect(() => assertSafePath('a/./b')).toThrow(/Unsafe path/)
  })
  it('allows normal domain paths', () => {
    expect(() => assertSafePath('todos')).not.toThrow()
    expect(() => assertSafePath('posts/2/comments/8/likes')).not.toThrow()
    expect(() => assertSafePath('users/check-nickname')).not.toThrow()
  })
})

describe('callExternal', () => {
  it('builds URL, method, Bearer and returns status+body', async () => {
    const calls = queueAdapter([{ status: 200, body: JSON.stringify({ ok: true }), contentType: 'application/json' }])
    const r = await callExternal({ method: 'GET', path: 'goals', search: '?limit=1', accessToken: 'TK' })
    expect(calls[0].url).toBe('https://api.test/indigo/goals?limit=1')
    expect(String(calls[0].method).toUpperCase()).toBe('GET')
    expect(AxiosHeaders.from(calls[0].headers as never).get('Authorization')).toBe('Bearer TK')
    expect(r.status).toBe(200)
    expect(JSON.parse(r.body)).toEqual({ ok: true })
    expect(r.contentType).toBe('application/json')
  })
  it('omits Authorization when no token; forwards body', async () => {
    const calls = queueAdapter([{ status: 200, body: '{}' }])
    await callExternal({ method: 'POST', path: 'auth/login', body: '{"x":1}', contentType: 'application/json' })
    expect(AxiosHeaders.from(calls[0].headers as never).has('Authorization')).toBe(false)
    expect(calls[0].data).toBe('{"x":1}')
  })
  it('rejects traversal path before any request', async () => {
    const calls = queueAdapter([{ status: 200, body: '{}' }])
    await expect(callExternal({ method: 'GET', path: '../secret' })).rejects.toThrow(/Unsafe path/)
    expect(calls.length).toBe(0)
  })
  it("nullish response body normalizes to empty string (not '\"\"')", async () => {
    backendHttp.defaults.adapter = (async (config) => ({
      data: undefined, status: 200, statusText: '', headers: {}, config,
    })) as import('axios').AxiosAdapter
    const r = await callExternal({ method: 'GET', path: 'x' })
    expect(r.body).toBe('')
  })
  it('prepends ? when search lacks it', async () => {
    const calls = queueAdapter([{ status: 200, body: '{}' }])
    await callExternal({ method: 'GET', path: 'todos', search: 'limit=1' })
    expect(calls[0].url).toBe('https://api.test/indigo/todos?limit=1')
  })
  it('keeps search as-is when ? already present', async () => {
    const calls = queueAdapter([{ status: 200, body: '{}' }])
    await callExternal({ method: 'GET', path: 'todos', search: '?limit=2' })
    expect(calls[0].url).toBe('https://api.test/indigo/todos?limit=2')
  })
})

describe('refreshTokens', () => {
  it('returns rotated tokens on success and sends the refresh token', async () => {
    const calls = queueAdapter([{ status: 200, body: JSON.stringify({ accessToken: 'NA', refreshToken: 'NR' }) }])
    expect(await refreshTokens('OLD')).toEqual({ accessToken: 'NA', refreshToken: 'NR' })
    expect(JSON.parse(calls[0].data as string)).toEqual({ refreshToken: 'OLD' })
  })
  it('returns null on failure', async () => {
    queueAdapter([{ status: 401, body: '{}' }])
    expect(await refreshTokens('OLD')).toBeNull()
  })
})

describe('passthrough', () => {
  it('204 → NextResponse 204 with no body (no throw)', () => {
    const res = passthrough({ status: 204, body: '', contentType: null })
    expect(res.status).toBe(204)
  })
  it('200 → body + content-type preserved', async () => {
    const res = passthrough({ status: 200, body: '{"a":1}', contentType: 'application/json' })
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('application/json')
    expect(await res.text()).toBe('{"a":1}')
  })
  it('304 → no body (no throw)', () => {
    expect(passthrough({ status: 304, body: '', contentType: null }).status).toBe(304)
  })
})
