/** @jest-environment node */
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/oauth/[provider]/route'
import { COOKIE } from '@/src/server/slidtodo'

beforeEach(() => {
  process.env.SLIDTODO_API_BASE_URL = 'https://api.test'
  process.env.SLIDTODO_TEAM_ID = 'indigo'
  jest.restoreAllMocks()
})

const ctx = (provider: string) => ({ params: Promise.resolve({ provider }) })
function req(provider: string, body: unknown) {
  return new NextRequest(`http://localhost/api/oauth/${provider}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

it('oauth: exchanges, sets cookies, returns { user }', async () => {
  const spy = jest.spyOn(global, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ accessToken: 'AA', refreshToken: 'RR', user: { id: 9, email: 'g@b.c', name: 'G', image: null } }), { status: 200 }),
  )
  const res = await POST(req('google', { token: 'gtok' }), ctx('google'))
  expect(spy.mock.calls[0][0]).toBe('https://api.test/indigo/oauth/google')
  expect(res.status).toBe(200)
  expect(await res.json()).toEqual({ user: { id: 9, email: 'g@b.c', name: 'G', image: null } })
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('AA')
  expect(res.cookies.get(COOKIE.REFRESH)?.value).toBe('RR')
})

it('oauth: passes external error through', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ message: 'bad token' }), { status: 401 }),
  )
  const res = await POST(req('kakao', { token: 'x' }), ctx('kakao'))
  expect(res.status).toBe(401)
  expect(res.cookies.get(COOKIE.ACCESS)).toBeUndefined()
})

it('oauth: malformed 2xx body → 502', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue(new Response('<html>nope</html>', { status: 200 }))
  const res = await POST(req('google', { token: 'gtok' }), ctx('google'))
  expect(res.status).toBe(502)
})
