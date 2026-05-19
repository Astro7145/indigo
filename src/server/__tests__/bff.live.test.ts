/** @jest-environment node */
import { NextRequest } from 'next/server'
import { POST as authPost } from '@/app/api/auth/[action]/route'
import { GET as proxyGet } from '@/app/api/[...path]/route'
import { COOKIE } from '@/src/server/backend'

const EMAIL = process.env.BACKEND_TEST_EMAIL
const PASSWORD = process.env.BACKEND_TEST_PASSWORD
const d = EMAIL && PASSWORD ? describe : describe.skip

beforeAll(() => {
  process.env.BACKEND_API_BASE_URL ||= 'https://slid-to-do-api.vercel.app'
  process.env.BACKEND_TEAM_ID ||= 'indigo'
})

function cookieHeaderFrom(res: import('next/server').NextResponse): string {
  const a = res.cookies.get(COOKIE.ACCESS)?.value ?? ''
  const r = res.cookies.get(COOKIE.REFRESH)?.value ?? ''
  return `${COOKIE.ACCESS}=${a}; ${COOKIE.REFRESH}=${r}`
}

d('BFF live (real SlidTodo API, teamId from env)', () => {
  jest.setTimeout(30000)

  it('login sets cookies and strips tokens; proxied GET works', async () => {
    const loginRes = await authPost(
      new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      }),
      { params: Promise.resolve({ action: 'login' }) },
    )
    expect(loginRes.status).toBe(200)
    const body = await loginRes.json()
    expect(body.user).toBeDefined()
    expect(body.accessToken).toBeUndefined()
    expect(loginRes.cookies.get(COOKIE.ACCESS)?.value).toBeTruthy()
    expect(loginRes.cookies.get(COOKIE.REFRESH)?.value).toBeTruthy()

    const meRes = await proxyGet(
      new NextRequest('http://localhost/api/users/me', {
        method: 'GET',
        headers: { cookie: cookieHeaderFrom(loginRes) },
      }),
      { params: Promise.resolve({ path: ['users', 'me'] }) },
    )
    expect(meRes.status).toBe(200)
  })

  it('refresh rotates cookies and the rotated cookies still authorize', async () => {
    const loginRes = await authPost(
      new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      }),
      { params: Promise.resolve({ action: 'login' }) },
    )
    const refreshRes = await authPost(
      new NextRequest('http://localhost/api/auth/refresh', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: cookieHeaderFrom(loginRes) },
      }),
      { params: Promise.resolve({ action: 'refresh' }) },
    )
    expect(refreshRes.status).toBe(204)
    expect(refreshRes.cookies.get(COOKIE.ACCESS)?.value).toBeTruthy()

    const meRes = await proxyGet(
      new NextRequest('http://localhost/api/users/me', {
        method: 'GET',
        headers: { cookie: cookieHeaderFrom(refreshRes) },
      }),
      { params: Promise.resolve({ path: ['users', 'me'] }) },
    )
    expect(meRes.status).toBe(200)
  })

  it('logout clears cookies; subsequent proxied GET is 401', async () => {
    const loginRes = await authPost(
      new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      }),
      { params: Promise.resolve({ action: 'login' }) },
    )
    const cookie = cookieHeaderFrom(loginRes)
    const logoutRes = await authPost(
      new NextRequest('http://localhost/api/auth/logout', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie },
      }),
      { params: Promise.resolve({ action: 'logout' }) },
    )
    expect(logoutRes.status).toBe(204)
    expect(logoutRes.cookies.get(COOKIE.ACCESS)?.value).toBe('')

    // cookies cleared by logout response → simulate the now-empty cookie jar
    const afterRes = await proxyGet(
      new NextRequest('http://localhost/api/users/me', {
        method: 'GET',
        headers: { cookie: `${COOKIE.ACCESS}=; ${COOKIE.REFRESH}=` },
      }),
      { params: Promise.resolve({ path: ['users', 'me'] }) },
    )
    expect(afterRes.status).toBe(401)
  })
})
