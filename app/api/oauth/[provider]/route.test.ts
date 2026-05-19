/** @jest-environment node */
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/oauth/[provider]/route'
import { COOKIE, backendHttp } from '@/src/server/backend'
import { type AxiosAdapter } from 'axios'

beforeEach(() => {
  process.env.BACKEND_API_BASE_URL = 'https://api.test'
  process.env.BACKEND_TEAM_ID = 'indigo'
  jest.restoreAllMocks()
})

type MockResp = { status: number; body?: string; contentType?: string }
function queueAdapter(responses: MockResp[]) {
  const calls: Parameters<AxiosAdapter>[0][] = []
  let i = 0
  backendHttp.defaults.adapter = (async (config) => {
    calls.push(config)
    const r = responses[Math.min(i, responses.length - 1)]
    i += 1
    return { data: r.body ?? '', status: r.status, statusText: '', headers: r.contentType ? { 'content-type': r.contentType } : {}, config }
  }) as AxiosAdapter
  return calls
}
afterEach(() => { delete (backendHttp.defaults as { adapter?: unknown }).adapter })

const ctx = (provider: string) => ({ params: Promise.resolve({ provider }) })
function req(provider: string, body: unknown) {
  return new NextRequest(`http://localhost/api/oauth/${provider}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

it('oauth: exchanges, sets cookies, returns { user }', async () => {
  const calls = queueAdapter([{ status: 200, body: JSON.stringify({ accessToken: 'AA', refreshToken: 'RR', user: { id: 9, email: 'g@b.c', name: 'G', image: null } }) }])
  const res = await POST(req('google', { token: 'gtok' }), ctx('google'))
  expect(calls[0].url).toBe('https://api.test/indigo/oauth/google')
  expect(res.status).toBe(200)
  expect(await res.json()).toEqual({ user: { id: 9, email: 'g@b.c', name: 'G', image: null } })
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('AA')
  expect(res.cookies.get(COOKIE.REFRESH)?.value).toBe('RR')
})

it('oauth: passes external error through', async () => {
  queueAdapter([{ status: 401, body: JSON.stringify({ message: 'bad token' }) }])
  const res = await POST(req('kakao', { token: 'x' }), ctx('kakao'))
  expect(res.status).toBe(401)
  expect(res.cookies.get(COOKIE.ACCESS)).toBeUndefined()
})

it('oauth: malformed 2xx body → 502', async () => {
  queueAdapter([{ status: 200, body: '<html>nope</html>' }])
  const res = await POST(req('google', { token: 'gtok' }), ctx('google'))
  expect(res.status).toBe(502)
})
