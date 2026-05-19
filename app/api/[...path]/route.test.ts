/** @jest-environment node */
import { NextRequest } from 'next/server'
import { GET, POST, PATCH, DELETE } from '@/app/api/[...path]/route'
import { COOKIE, backendHttp } from '@/src/server/backend'
import { AxiosHeaders, type AxiosAdapter } from 'axios'

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

const ctx = (path: string[]) => ({ params: Promise.resolve({ path }) })
function r(url: string, method: string, cookie?: string, body?: string) {
  return new NextRequest(`http://localhost${url}`, {
    method,
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
    body,
  })
}

it('forwards GET with Bearer + query, passes body/status through', async () => {
  const calls = queueAdapter([{ status: 200, body: JSON.stringify({ goals: [] }), contentType: 'application/json' }])
  const res = await GET(r('/api/goals?limit=2', 'GET', `${COOKIE.ACCESS}=TK`), ctx(['goals']))
  expect(calls[0].url).toBe('https://api.test/indigo/goals?limit=2')
  expect(AxiosHeaders.from(calls[0].headers as never).get('Authorization')).toBe('Bearer TK')
  expect(res.status).toBe(200)
  expect(await res.json()).toEqual({ goals: [] })
})

it('no access cookie → 401 without calling external', async () => {
  const calls = queueAdapter([{ status: 200, body: '{}' }])
  const res = await GET(r('/api/goals', 'GET'), ctx(['goals']))
  expect(res.status).toBe(401)
  expect(calls.length).toBe(0)
})

it('401 → refresh → retry with new token → success + rotated cookies', async () => {
  const calls = queueAdapter([
    { status: 401, body: JSON.stringify({ message: 'unauthorized' }) },
    { status: 200, body: JSON.stringify({ accessToken: 'NA', refreshToken: 'NR' }) },
    { status: 200, body: JSON.stringify({ ok: true }), contentType: 'application/json' },
  ])
  const res = await GET(r('/api/goals', 'GET', `${COOKIE.ACCESS}=OLD; ${COOKIE.REFRESH}=RFR`), ctx(['goals']))
  expect(res.status).toBe(200)
  expect(await res.json()).toEqual({ ok: true })
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('NA')
  expect(res.cookies.get(COOKIE.REFRESH)?.value).toBe('NR')
  expect(AxiosHeaders.from(calls[2].headers as never).get('Authorization')).toBe('Bearer NA')
})

it('401 → refresh fails → clear cookies + 401', async () => {
  queueAdapter([
    { status: 401, body: '{}' },
    { status: 401, body: '{}' },
  ])
  const res = await GET(r('/api/goals', 'GET', `${COOKIE.ACCESS}=OLD; ${COOKIE.REFRESH}=RFR`), ctx(['goals']))
  expect(res.status).toBe(401)
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('')
  expect(res.cookies.get(COOKIE.REFRESH)?.value).toBe('')
})

it('401 with access but no refresh cookie → clear + 401', async () => {
  const calls = queueAdapter([
    { status: 401, body: '{}' },
  ])
  const res = await GET(r('/api/goals', 'GET', `${COOKIE.ACCESS}=OLD`), ctx(['goals']))
  expect(res.status).toBe(401)
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('')
  expect(res.cookies.get(COOKIE.REFRESH)?.value).toBe('')
  expect(calls.length).toBe(1) // no refresh attempt without a refresh cookie
})

it('refresh succeeds but retry still 401 → rotated cookies + 401 passthrough', async () => {
  queueAdapter([
    { status: 401, body: '{}' },
    { status: 200, body: JSON.stringify({ accessToken: 'NA', refreshToken: 'NR' }) },
    { status: 401, body: JSON.stringify({ message: 'still 401' }) },
  ])
  const res = await GET(r('/api/goals', 'GET', `${COOKIE.ACCESS}=OLD; ${COOKIE.REFRESH}=RFR`), ctx(['goals']))
  expect(res.status).toBe(401)
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('NA')
  expect(res.cookies.get(COOKIE.REFRESH)?.value).toBe('NR')
})

it('PATCH forwards body and rotated path', async () => {
  const calls = queueAdapter([{ status: 200, body: '{}' }])
  await PATCH(r('/api/todos/5', 'PATCH', `${COOKIE.ACCESS}=TK`, '{"done":true}'), ctx(['todos', '5']))
  expect(calls[0].url).toBe('https://api.test/indigo/todos/5')
  expect(calls[0].data).toBe('{"done":true}')
})

it('POST forwards body and nested path', async () => {
  const calls = queueAdapter([{ status: 201, body: '{}' }])
  await POST(r('/api/posts/2/comments', 'POST', `${COOKIE.ACCESS}=TK`, '{"content":"hi"}'), ctx(['posts', '2', 'comments']))
  expect(calls[0].url).toBe('https://api.test/indigo/posts/2/comments')
  expect(calls[0].data).toBe('{"content":"hi"}')
})

it('exports PATCH and DELETE handlers', () => {
  expect(typeof PATCH).toBe('function')
  expect(typeof DELETE).toBe('function')
})
