/** @jest-environment node */
import { NextRequest } from 'next/server'
import { GET, POST, PATCH, DELETE } from '@/app/api/[...path]/route'
import { COOKIE } from '@/src/server/slidtodo'

beforeEach(() => {
  process.env.SLIDTODO_API_BASE_URL = 'https://api.test'
  process.env.SLIDTODO_TEAM_ID = 'indigo'
  jest.restoreAllMocks()
})

const ctx = (path: string[]) => ({ params: Promise.resolve({ path }) })
function r(url: string, method: string, cookie?: string, body?: string) {
  return new NextRequest(`http://localhost${url}`, {
    method,
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
    body,
  })
}

it('forwards GET with Bearer + query, passes body/status through', async () => {
  const spy = jest.spyOn(global, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ goals: [] }), { status: 200, headers: { 'content-type': 'application/json' } }),
  )
  const res = await GET(r('/api/goals?limit=2', 'GET', `${COOKIE.ACCESS}=TK`), ctx(['goals']))
  expect(spy.mock.calls[0][0]).toBe('https://api.test/indigo/goals?limit=2')
  expect(new Headers((spy.mock.calls[0][1] as RequestInit).headers).get('authorization')).toBe('Bearer TK')
  expect(res.status).toBe(200)
  expect(await res.json()).toEqual({ goals: [] })
})

it('no access cookie → 401 without calling external', async () => {
  const spy = jest.spyOn(global, 'fetch')
  const res = await GET(r('/api/goals', 'GET'), ctx(['goals']))
  expect(res.status).toBe(401)
  expect(spy).not.toHaveBeenCalled()
})

it('401 → refresh → retry with new token → success + rotated cookies', async () => {
  const spy = jest.spyOn(global, 'fetch')
    .mockResolvedValueOnce(new Response(JSON.stringify({ message: 'unauthorized' }), { status: 401 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ accessToken: 'NA', refreshToken: 'NR' }), { status: 200 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } }))
  const res = await GET(r('/api/goals', 'GET', `${COOKIE.ACCESS}=OLD; ${COOKIE.REFRESH}=RFR`), ctx(['goals']))
  expect(res.status).toBe(200)
  expect(await res.json()).toEqual({ ok: true })
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('NA')
  expect(new Headers((spy.mock.calls[2][1] as RequestInit).headers).get('authorization')).toBe('Bearer NA')
})

it('401 → refresh fails → clear cookies + 401', async () => {
  jest.spyOn(global, 'fetch')
    .mockResolvedValueOnce(new Response('{}', { status: 401 }))
    .mockResolvedValueOnce(new Response('{}', { status: 401 }))
  const res = await GET(r('/api/goals', 'GET', `${COOKIE.ACCESS}=OLD; ${COOKIE.REFRESH}=RFR`), ctx(['goals']))
  expect(res.status).toBe(401)
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('')
})

it('POST forwards body and nested path', async () => {
  const spy = jest.spyOn(global, 'fetch').mockResolvedValue(new Response('{}', { status: 201 }))
  await POST(r('/api/posts/2/comments', 'POST', `${COOKIE.ACCESS}=TK`, '{"content":"hi"}'), ctx(['posts', '2', 'comments']))
  expect(spy.mock.calls[0][0]).toBe('https://api.test/indigo/posts/2/comments')
  expect((spy.mock.calls[0][1] as RequestInit).body).toBe('{"content":"hi"}')
})

it('exports PATCH and DELETE handlers', () => {
  expect(typeof PATCH).toBe('function')
  expect(typeof DELETE).toBe('function')
})
