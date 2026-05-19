import { NextResponse, type NextRequest } from 'next/server'
import {
  callExternal,
  parseAuthCookies,
  refreshTokens,
  setAuthCookies,
  clearAuthCookies,
  passthrough,
} from '@/src/server/slidtodo'

type Ctx = { params: Promise<{ path: string[] }> }

async function handle(req: NextRequest, ctx: Ctx): Promise<NextResponse> {
  const { path } = await ctx.params
  const joined = path.join('/')
  const search = req.nextUrl.search
  const { access, refresh } = parseAuthCookies(req)

  if (!access) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 })
  }

  const hasBody = req.method === 'POST' || req.method === 'PATCH'
  const body = hasBody ? await req.text() : undefined
  const contentType = req.headers.get('content-type') ?? undefined

  const first = await callExternal({
    method: req.method,
    path: joined,
    search,
    accessToken: access,
    body,
    contentType,
  })

  if (first.status !== 401) {
    return passthrough(first)
  }

  const tokens = refresh ? await refreshTokens(refresh) : null
  if (!tokens) {
    const out = NextResponse.json({ message: 'Authentication required' }, { status: 401 })
    clearAuthCookies(out)
    return out
  }

  // refresh가 성공하면 회전된 토큰은 유효하므로, 재시도가 또 401이어도
  // 회전된 쿠키를 set하고 upstream 응답(401 포함)을 그대로 전달한다
  // (다음 요청은 새 토큰을 사용; 여기서 추가 재시도/clear는 하지 않는다).
  const retry = await callExternal({
    method: req.method,
    path: joined,
    search,
    accessToken: tokens.accessToken,
    body,
    contentType,
  })
  const out = passthrough(retry)
  setAuthCookies(out, tokens)
  return out
}

export const GET = handle
export const POST = handle
export const PATCH = handle
export const DELETE = handle
