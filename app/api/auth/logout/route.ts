import { NextResponse, type NextRequest } from 'next/server';
import { callExternal, parseAuthCookies, clearAuthCookies } from '@/src/api/server/server-fetcher';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { refresh } = parseAuthCookies(req);
  if (refresh) {
    await callExternal({
      method: 'POST',
      path: 'auth/logout',
      body: JSON.stringify({ refreshToken: refresh }),
      contentType: 'application/json',
    }).catch(() => {
      // best-effort: upstream/network failure must not block cookie clearing
    });
  }
  const out = new NextResponse(null, { status: 204 });
  clearAuthCookies(out);
  return out;
}
