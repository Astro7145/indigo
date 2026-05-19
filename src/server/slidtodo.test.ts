/** @jest-environment node */
import { NextResponse } from 'next/server'
import {
  externalBase,
  parseAuthCookies,
  setAuthCookies,
  clearAuthCookies,
  callExternal,
  refreshTokens,
  COOKIE,
} from '@/src/server/slidtodo'

beforeEach(() => {
  process.env.SLIDTODO_API_BASE_URL = 'https://api.test'
  process.env.SLIDTODO_TEAM_ID = 'indigo'
  jest.restoreAllMocks()
})

describe('externalBase', () => {
  it('joins base and teamId', () => {
    expect(externalBase()).toBe('https://api.test/indigo')
  })
  it('throws when env missing', () => {
    delete process.env.SLIDTODO_TEAM_ID
    expect(() => externalBase()).toThrow(/SLIDTODO_TEAM_ID/)
  })
  it('throws when SLIDTODO_API_BASE_URL missing', () => {
    delete process.env.SLIDTODO_API_BASE_URL
    expect(() => externalBase()).toThrow(/SLIDTODO_API_BASE_URL/)
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

describe('callExternal', () => {
  it('builds URL, method, Bearer and returns status+body', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } }),
    )
    const r = await callExternal({ method: 'GET', path: 'goals', search: '?limit=1', accessToken: 'TK' })
    const [url, init] = spy.mock.calls[0]
    expect(url).toBe('https://api.test/indigo/goals?limit=1')
    expect((init as RequestInit).method).toBe('GET')
    expect(new Headers((init as RequestInit).headers).get('authorization')).toBe('Bearer TK')
    expect(r.status).toBe(200)
    expect(JSON.parse(r.body)).toEqual({ ok: true })
  })
  it('omits Authorization when no token', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))
    await callExternal({ method: 'POST', path: 'auth/login', body: '{"x":1}', contentType: 'application/json' })
    const init = spy.mock.calls[0][1] as RequestInit
    expect(new Headers(init.headers).has('authorization')).toBe(false)
    expect(init.body).toBe('{"x":1}')
  })
})

describe('refreshTokens', () => {
  it('returns rotated tokens on success', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ accessToken: 'NA', refreshToken: 'NR' }), { status: 200 }),
    )
    expect(await refreshTokens('OLD')).toEqual({ accessToken: 'NA', refreshToken: 'NR' })
    const body = JSON.parse((spy.mock.calls[0][1] as RequestInit).body as string)
    expect(body).toEqual({ refreshToken: 'OLD' })
  })
  it('returns null on failure', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response('{}', { status: 401 }))
    expect(await refreshTokens('OLD')).toBeNull()
  })
})
