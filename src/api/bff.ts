// SERVER-ONLY: BFF 코어 (next/server·process.env.BACKEND_*·외부 axios).
// 클라이언트 코드에서 import 금지 — 서버 라우트 핸들러 전용.
import axios from 'axios'
import { NextResponse, type NextRequest } from 'next/server'

export class ApiPathError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ApiPathError'
  }
}

export const COOKIE = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
} as const

const REFRESH_MAX_AGE = 60 * 60 * 24 * 14 // 14d

// 외부 백엔드 호출 전용 axios 인스턴스 (클라이언트 axiosInstance와 분리:
// 그건 /api·ApiError 정규화용). validateStatus:()=>true → 4xx/5xx도 throw 없이
// 그대로 프록시. responseType/transformResponse → 본문을 원문 문자열로 유지
// (라우트가 직접 JSON.parse). NextResponse 쪽은 변경 없음.
export const backendHttp = axios.create({
  validateStatus: () => true,
  responseType: 'text',
  transformResponse: [(d) => d],
})

export function externalBase(): string {
  const base = process.env.BACKEND_API_BASE_URL
  const team = process.env.BACKEND_TEAM_ID
  if (!base) throw new Error('BACKEND_API_BASE_URL is not set')
  if (!team) throw new Error('BACKEND_TEAM_ID is not set')
  return `${base.replace(/\/+$/, '')}/${team.replace(/^\/+|\/+$/g, '')}`
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  }
}

type ReqLike = Pick<NextRequest, 'cookies'>

export function parseAuthCookies(req: ReqLike): { access?: string; refresh?: string } {
  return {
    access: req.cookies.get(COOKIE.ACCESS)?.value,
    refresh: req.cookies.get(COOKIE.REFRESH)?.value,
  }
}

// access 쿠키는 의도적으로 세션 스코프(maxAge 없음) — 탭 종료 시 만료된다.
// catch-all 핸들러는 401 시 refresh 쿠키로 silent refresh를 시도해야 한다.
export function setAuthCookies(
  res: NextResponse,
  tokens: { accessToken: string; refreshToken?: string | null },
): void {
  res.cookies.set(COOKIE.ACCESS, tokens.accessToken, cookieOptions())
  if (tokens.refreshToken) {
    res.cookies.set(COOKIE.REFRESH, tokens.refreshToken, {
      ...cookieOptions(),
      maxAge: REFRESH_MAX_AGE,
    })
  }
}

export function clearAuthCookies(res: NextResponse): void {
  res.cookies.set(COOKIE.ACCESS, '', { ...cookieOptions(), maxAge: 0 })
  res.cookies.set(COOKIE.REFRESH, '', { ...cookieOptions(), maxAge: 0 })
}

export interface ExternalResult {
  status: number
  body: string
  contentType: string | null
}

/** 경로 세그먼트에 traversal/빈 세그먼트가 있으면 던진다 (teamId 경계 우회 방지). */
export function assertSafePath(path: string): void {
  const segs = path.split('/')
  if (segs.some((s) => s === '' || s === '.' || s === '..')) {
    throw new ApiPathError(`Unsafe path segment in "${path}"`)
  }
}

export async function callExternal(opts: {
  method: string
  path: string
  search?: string
  accessToken?: string
  body?: string
  contentType?: string
}): Promise<ExternalResult> {
  assertSafePath(opts.path)
  const headers: Record<string, string> = {}
  if (opts.accessToken) headers.Authorization = `Bearer ${opts.accessToken}`
  if (opts.body !== undefined) {
    headers['Content-Type'] = opts.contentType ?? 'application/json'
  }
  // opts.path must NOT start with '/' (joined as `${base}/${path}`); search includes leading '?'
  const url = `${externalBase()}/${opts.path}${opts.search ?? ''}`
  const res = await backendHttp.request({
    url,
    method: opts.method,
    headers,
    data: opts.body,
  })
  const body = typeof res.data === 'string' ? res.data : JSON.stringify(res.data ?? '')
  const ct = res.headers['content-type']
  return {
    status: res.status,
    body,
    contentType: typeof ct === 'string' ? ct : null,
  }
}

/** 외부 응답을 그대로(상태·바디·content-type) 클라이언트로 통과시킨다. */
export function passthrough(r: ExternalResult): NextResponse {
  // 204/205/304는 null-body 상태 — 빈 문자열이라도 body를 주면 Response 생성자가 throw한다.
  const nullBody = r.status === 204 || r.status === 205 || r.status === 304
  const body = nullBody || r.body === '' ? null : r.body
  return new NextResponse(body, {
    status: r.status,
    headers: !nullBody && r.contentType ? { 'content-type': r.contentType } : undefined,
  })
}

export async function refreshTokens(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string | null } | null> {
  const r = await callExternal({
    method: 'POST',
    path: 'auth/refresh',
    body: JSON.stringify({ refreshToken }),
    contentType: 'application/json',
  })
  if (r.status < 200 || r.status >= 300) return null
  try {
    const data = JSON.parse(r.body) as { accessToken?: string; refreshToken?: string | null }
    if (!data.accessToken) return null
    return { accessToken: data.accessToken, refreshToken: data.refreshToken ?? null }
  } catch {
    return null
  }
}
