import { NextResponse, type NextRequest } from 'next/server'

export const COOKIE = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
} as const

const REFRESH_MAX_AGE = 60 * 60 * 24 * 14 // 14d

export function externalBase(): string {
  const base = process.env.BACKEND_API_BASE_URL
  const team = process.env.BACKEND_TEAM_ID
  if (!base) throw new Error('BACKEND_API_BASE_URL is not set')
  if (!team) throw new Error('BACKEND_TEAM_ID is not set')
  return `${base}/${team}`
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

export async function callExternal(opts: {
  method: string
  path: string
  search?: string
  accessToken?: string
  body?: string
  contentType?: string
}): Promise<ExternalResult> {
  const headers: Record<string, string> = {}
  if (opts.accessToken) headers.Authorization = `Bearer ${opts.accessToken}`
  if (opts.body !== undefined) {
    headers['Content-Type'] = opts.contentType ?? 'application/json'
  }
  // opts.path must NOT start with '/' (joined as `${base}/${path}`); search includes leading '?'
  const url = `${externalBase()}/${opts.path}${opts.search ?? ''}`
  const r = await fetch(url, {
    method: opts.method,
    headers,
    body: opts.body,
  })
  return {
    status: r.status,
    body: await r.text(),
    contentType: r.headers.get('content-type'),
  }
}

/** 외부 응답을 그대로(상태·바디·content-type) 클라이언트로 통과시킨다. */
export function passthrough(r: ExternalResult): NextResponse {
  return new NextResponse(r.body, {
    status: r.status,
    headers: r.contentType ? { 'content-type': r.contentType } : undefined,
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
