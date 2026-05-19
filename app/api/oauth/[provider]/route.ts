import { NextResponse, type NextRequest } from 'next/server'
import { callExternal, passthrough, setAuthCookies } from '@/src/api/server/bff'

type Ctx = { params: Promise<{ provider: string }> }

export async function POST(req: NextRequest, ctx: Ctx): Promise<NextResponse> {
  const { provider } = await ctx.params
  const body = await req.text()
  const r = await callExternal({
    method: 'POST',
    path: `oauth/${provider}`,
    body,
    contentType: 'application/json',
  })
  if (r.status < 200 || r.status >= 300) {
    return passthrough(r)
  }
  let data: { accessToken: string; refreshToken?: string; user: unknown }
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
