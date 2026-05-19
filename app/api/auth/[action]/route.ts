import { NextResponse, type NextRequest } from 'next/server'
import {
  callExternal,
  parseAuthCookies,
  refreshTokens,
  setAuthCookies,
  clearAuthCookies,
} from '@/src/server/slidtodo'

type Ctx = { params: Promise<{ action: string }> }

function passthrough(r: { status: number; body: string; contentType: string | null }) {
  return new NextResponse(r.body, {
    status: r.status,
    headers: r.contentType ? { 'content-type': r.contentType } : undefined,
  })
}

export async function POST(req: NextRequest, ctx: Ctx): Promise<NextResponse> {
  const { action } = await ctx.params

  if (action === 'login' || action === 'signup') {
    const body = await req.text()
    const r = await callExternal({
      method: 'POST',
      path: `auth/${action}`,
      body,
      contentType: 'application/json',
    })
    if (r.status < 200 || r.status >= 300) return passthrough(r)
    let data: { accessToken: string; refreshToken: string; user: unknown }
    try {
      data = JSON.parse(r.body)
    } catch {
      return NextResponse.json(
        { message: 'Upstream returned invalid response' },
        { status: 502 },
      )
    }
    const res = NextResponse.json({ user: data.user }, { status: 200 })
    setAuthCookies(res, { accessToken: data.accessToken, refreshToken: data.refreshToken })
    return res
  }

  if (action === 'refresh') {
    const { refresh } = parseAuthCookies(req)
    const tokens = refresh ? await refreshTokens(refresh) : null
    if (!tokens) {
      const out = NextResponse.json({ message: 'Authentication required' }, { status: 401 })
      clearAuthCookies(out)
      return out
    }
    const out = new NextResponse(null, { status: 204 })
    setAuthCookies(out, tokens)
    return out
  }

  if (action === 'logout') {
    const { refresh } = parseAuthCookies(req)
    if (refresh) {
      await callExternal({
        method: 'POST',
        path: 'auth/logout',
        body: JSON.stringify({ refreshToken: refresh }),
        contentType: 'application/json',
      }).catch(() => {
        // best-effort: upstream/network failure must not block cookie clearing
      })
    }
    const out = new NextResponse(null, { status: 204 })
    clearAuthCookies(out)
    return out
  }

  return NextResponse.json({ message: 'Not found' }, { status: 404 })
}
