import { NextResponse, type NextRequest } from 'next/server';
import { parseAuthCookies, refreshTokens, setAuthCookies, clearAuthCookies } from '@/src/api/server/server-fetcher';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { refresh } = parseAuthCookies(req);
  const tokens = refresh ? await refreshTokens(refresh) : null;
  if (!tokens) {
    const out = NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    clearAuthCookies(out);
    return out;
  }
  const out = new NextResponse(null, { status: 204 });
  setAuthCookies(out, tokens);
  return out;
}
