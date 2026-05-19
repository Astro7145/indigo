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

  const hasBody = req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT'
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
