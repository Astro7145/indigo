/** @jest-environment node */
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/[action]/route'
import { COOKIE } from '@/src/server/slidtodo'

beforeEach(() => {
  process.env.SLIDTODO_API_BASE_URL = 'https://api.test'
  process.env.SLIDTODO_TEAM_ID = 'indigo'
  jest.restoreAllMocks()
})

function req(action: string, body?: unknown, cookie?: string) {
  return new NextRequest(`http://localhost/api/auth/${action}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}
const ctx = (action: string) => ({ params: Promise.resolve({ action }) })

it('login: sets cookies, strips tokens, returns { user }', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ accessToken: 'AA', refreshToken: 'RR', user: { id: 1, email: 'a@b.c', name: 'n', image: null } }), { status: 200 }),
  )
  const res = await POST(req('login', { email: 'a@b.c', password: 'pw' }), ctx('login'))
  expect(res.status).toBe(200)
  expect(await res.json()).toEqual({ user: { id: 1, email: 'a@b.c', name: 'n', image: null } })
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('AA')
  expect(res.cookies.get(COOKIE.REFRESH)?.value).toBe('RR')
})

it('login: passes external error through', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ message: 'Invalid email or password' }), { status: 401 }),
  )
  const res = await POST(req('login', { email: 'x', password: 'y' }), ctx('login'))
  expect(res.status).toBe(401)
  expect(await res.json()).toEqual({ message: 'Invalid email or password' })
  expect(res.cookies.get(COOKIE.ACCESS)).toBeUndefined()
})

it('refresh: rotates cookies, 204', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ accessToken: 'NA', refreshToken: 'NR' }), { status: 200 }),
  )
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
  jest.spyOn(global, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))
  const res = await POST(req('logout', undefined, `${COOKIE.REFRESH}=OLD`), ctx('logout'))
  expect(res.status).toBe(204)
  expect(res.cookies.get(COOKIE.REFRESH)?.value).toBe('')
})

it('unknown action → 404', async () => {
  const res = await POST(req('bogus'), ctx('bogus'))
  expect(res.status).toBe(404)
})
