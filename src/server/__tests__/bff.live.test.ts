/** @jest-environment node */
import { NextRequest } from 'next/server'
import { POST as authPost } from '@/app/api/auth/[action]/route'
import { GET as proxyGet } from '@/app/api/[...path]/route'
import { COOKIE } from '@/src/server/slidtodo'

const EMAIL = process.env.SLIDTODO_TEST_EMAIL
const PASSWORD = process.env.SLIDTODO_TEST_PASSWORD
const d = EMAIL && PASSWORD ? describe : describe.skip

beforeAll(() => {
  process.env.SLIDTODO_API_BASE_URL ||= 'https://slid-to-do-api.vercel.app'
  process.env.SLIDTODO_TEAM_ID ||= 'indigo'
})

function cookieHeaderFrom(res: import('next/server').NextResponse): string {
  const a = res.cookies.get(COOKIE.ACCESS)?.value ?? ''
  const r = res.cookies.get(COOKIE.REFRESH)?.value ?? ''
  return `${COOKIE.ACCESS}=${a}; ${COOKIE.REFRESH}=${r}`
}

d('BFF live (real SlidTodo API, teamId from env)', () => {
  jest.setTimeout(30000)

  it('login → cookies set, no tokens in body; proxied GET works; logout clears', async () => {
    const loginReq = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    })
    const loginRes = await authPost(loginReq, { params: Promise.resolve({ action: 'login' }) })
    expect(loginRes.status).toBe(200)
    const loginBody = await loginRes.json()
    expect(loginBody.user).toBeDefined()
    expect(loginBody.accessToken).toBeUndefined()
    expect(loginRes.cookies.get(COOKIE.ACCESS)?.value).toBeTruthy()

    const cookie = cookieHeaderFrom(loginRes)

    const meReq = new NextRequest('http://localhost/api/users/me', {
      method: 'GET',
      headers: { cookie },
    })
    const meRes = await proxyGet(meReq, { params: Promise.resolve({ path: ['users', 'me'] }) })
    expect(meRes.status).toBe(200)

    const logoutReq = new NextRequest('http://localhost/api/auth/logout', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie },
    })
    const logoutRes = await authPost(logoutReq, { params: Promise.resolve({ action: 'logout' }) })
    expect(logoutRes.status).toBe(204)
    expect(logoutRes.cookies.get(COOKIE.ACCESS)?.value).toBe('')
  })
})
