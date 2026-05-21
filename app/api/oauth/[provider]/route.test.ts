/** @jest-environment node */
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/oauth/[provider]/route'
import { COOKIE, backendHttp } from '@/src/api/server/bff'
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

it('oauth: 토큰을 교환하고 쿠키를 설정한 뒤 { user }를 반환한다', async () => {
  const calls = queueAdapter([{ status: 200, body: JSON.stringify({ accessToken: 'AA', refreshToken: 'RR', user: { id: 9, email: 'g@b.c', name: 'G', image: null } }) }])
  const res = await POST(req('google', { token: 'gtok' }), ctx('google'))
  expect(calls[0].url).toBe('https://api.test/indigo/oauth/google')
  expect(res.status).toBe(200)
  expect(await res.json()).toEqual({ user: { id: 9, email: 'g@b.c', name: 'G', image: null } })
  expect(res.cookies.get(COOKIE.ACCESS)?.value).toBe('AA')
  expect(res.cookies.get(COOKIE.REFRESH)?.value).toBe('RR')
})

it('oauth: 외부 에러를 그대로 전달한다', async () => {
  queueAdapter([{ status: 401, body: JSON.stringify({ message: 'bad token' }) }])
  const res = await POST(req('kakao', { token: 'x' }), ctx('kakao'))
  expect(res.status).toBe(401)
  expect(res.cookies.get(COOKIE.ACCESS)).toBeUndefined()
})

it('oauth: 잘못된 형식의 2xx 본문 → 502', async () => {
  queueAdapter([{ status: 200, body: '<html>nope</html>' }])
  const res = await POST(req('google', { token: 'gtok' }), ctx('google'))
  expect(res.status).toBe(502)
})
