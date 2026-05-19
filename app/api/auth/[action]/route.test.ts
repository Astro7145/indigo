/** @jest-environment node */
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/[action]/route'
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
function rejectingAdapter(err: Error) {
  const calls: Parameters<AxiosAdapter>[0][] = []
  backendHttp.defaults.adapter = (async (config) => { calls.push(config); throw err }) as AxiosAdapter
  return calls
}
afterEach(() => { delete (backendHttp.defaults as { adapter?: unknown }).adapter })

function req(action: string, body?: unknown, cookie?: string) {
  return new NextRequest(`http://localhost/api/auth/${action}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}
const ctx = (action: string) => ({ params: Promise.resolve({ action }) })

it('login: sets cookies, strips tokens, returns { user }', async () => {
  queueAdapter([{ status: 200, body: JSON.stringify({ accessToken: 'AA', refreshToken: 'RR', user: { id: 1, email: 'a@b.c', name: 'n', image: null } }) }])
  const res = await POST(req('login', { email: 'a@b.c', password: 'pw' }), ctx('login'))
  expect(res.status).toBe(200)
  expect(await res.json()).toEqual({ user: { id: 1, email: 'a@b.c', name: 'n', image: null } })
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('AA')
  expect(res.cookies.get(COOKIE.REFRESH)?.value).toBe('RR')
})

it('login: passes external error through', async () => {
  queueAdapter([{ status: 401, body: JSON.stringify({ message: 'Invalid email or password' }) }])
  const res = await POST(req('login', { email: 'x', password: 'y' }), ctx('login'))
  expect(res.status).toBe(401)
  expect(await res.json()).toEqual({ message: 'Invalid email or password' })
  expect(res.cookies.get(COOKIE.ACCESS)).toBeUndefined()
})

it('signup: sets cookies and returns { user }', async () => {
  queueAdapter([{ status: 201, body: JSON.stringify({ accessToken: 'AA', refreshToken: 'RR', user: { id: 2, email: 's@b.c', name: 's', image: null } }) }])
  const res = await POST(req('signup', { email: 's@b.c', name: 's', password: 'pw' }), ctx('signup'))
  expect(res.status).toBe(200)
  expect(await res.json()).toEqual({ user: { id: 2, email: 's@b.c', name: 's', image: null } })
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('AA')
})

it('login: malformed 2xx body → 502', async () => {
  queueAdapter([{ status: 200, body: '<html>not json</html>' }])
  const res = await POST(req('login', { email: 'a@b.c', password: 'pw' }), ctx('login'))
  expect(res.status).toBe(502)
})

it('login error passthrough keeps content-type', async () => {
  queueAdapter([{ status: 401, body: JSON.stringify({ message: 'nope' }), contentType: 'application/json' }])
  const res = await POST(req('login', { email: 'x', password: 'y' }), ctx('login'))
  expect(res.status).toBe(401)
  expect(res.headers.get('content-type')).toBe('application/json')
})

it('logout without refresh cookie → 204 + cleared, no upstream call', async () => {
  const calls = queueAdapter([{ status: 200, body: '{}' }])
  const res = await POST(req('logout'), ctx('logout'))
  expect(res.status).toBe(204)
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('')
  expect(calls.length).toBe(0)
})

it('logout still clears cookies when upstream call rejects', async () => {
  rejectingAdapter(new Error('network down'))
  const res = await POST(req('logout', undefined, `${COOKIE.REFRESH}=OLD`), ctx('logout'))
  expect(res.status).toBe(204)
  expect(res.cookies.get(COOKIE.REFRESH)?.value).toBe('')
})

it('refresh: rotates cookies, 204', async () => {
  queueAdapter([{ status: 200, body: JSON.stringify({ accessToken: 'NA', refreshToken: 'NR' }) }])
  const res = await POST(req('refresh', undefined, `${COOKIE.REFRESH}=OLD`), ctx('refresh'))
  expect(res.status).toBe(204)
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('NA')
})

it('refresh: no refresh cookie → 401 + cleared', async () => {
  const res = await POST(req('refresh'), ctx('refresh'))
  expect(res.status).toBe(401)
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('')
})

it('logout: clears cookies, 204 (best effort)', async () => {
  queueAdapter([{ status: 200, body: '{}' }])
  const res = await POST(req('logout', undefined, `${COOKIE.REFRESH}=OLD`), ctx('logout'))
  expect(res.status).toBe(204)
  expect(res.cookies.get(COOKIE.REFRESH)?.value).toBe('')
})

it('unknown action → 404', async () => {
  const res = await POST(req('bogus'), ctx('bogus'))
  expect(res.status).toBe(404)
})
