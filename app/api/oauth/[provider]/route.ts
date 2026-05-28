import { NextResponse, type NextRequest } from 'next/server';
import { callExternal, passthrough, setAuthCookies } from '@/src/api/server/bff';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/utils/auth';

type Ctx = { params: Promise<{ provider: string }> };

export async function GET(req: NextRequest, ctx: Ctx): Promise<NextResponse> {
  const { provider } = await ctx.params;
  // 리다이렉트 기준 origin은 요청에서 직접 얻는다
  const { origin } = req.nextUrl;
  // Auth.js에서 소셜 로그인을 통해 발급 받은 토큰을 세션으로부터 불러옴
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.redirect(new URL('/login', origin));
  }

  const r = await callExternal({
    method: 'POST',
    path: `oauth/${provider}`,
    body: JSON.stringify({ token: session.accessToken }),
    contentType: 'application/json',
  });

  if (r.status < 200 || r.status >= 300) {
    return passthrough(r);
  }

  let data: { accessToken: string; refreshToken?: string; user: unknown };

  try {
    data = JSON.parse(r.body);
  } catch {
    return NextResponse.redirect(new URL('/login?error=parse', origin));
  }

  const res = NextResponse.redirect(new URL('/', origin));
  setAuthCookies(res, { accessToken: data.accessToken, refreshToken: data.refreshToken });

  return res;
}
