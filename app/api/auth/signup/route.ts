import { NextResponse, type NextRequest } from 'next/server';
import { callExternal, passthrough, setAuthCookies } from '@/src/api/server/server-fetcher';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.text();
  const r = await callExternal({
    method: 'POST',
    path: `auth/signup`,
    body,
    contentType: 'application/json',
  });
  if (r.status < 200 || r.status >= 300) return passthrough(r);
  let data: { accessToken: string; refreshToken?: string; user: unknown };
  try {
    data = JSON.parse(r.body);
  } catch {
    return NextResponse.json({ message: 'Upstream returned invalid response' }, { status: 502 });
  }
  // login·signup 모두 200으로 정규화 (upstream signup은 201을 반환)
  const res = NextResponse.json({ user: data.user }, { status: 200 });
  setAuthCookies(res, { accessToken: data.accessToken, refreshToken: data.refreshToken });
  return res;
}
