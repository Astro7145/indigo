import { NextResponse, type NextRequest } from 'next/server';
import {
  callExternal,
  parseAuthCookies,
  refreshTokens,
  setAuthCookies,
  clearAuthCookies,
  passthrough,
  type HttpMethod,
} from '@/src/api/server/bff';

type Ctx = { params: Promise<{ path: string[] }> };

async function handle(req: NextRequest, ctx: Ctx): Promise<NextResponse> {
  const { path } = await ctx.params;

  if (!path?.length || path.some((s) => s === '' || s === '.' || s === '..')) {
    return NextResponse.json({ message: 'Invalid path' }, { status: 400 });
  }

  const joined = path.join('/');
  const search = req.nextUrl.search;
  const { access, refresh } = parseAuthCookies(req);

  // DELETE/GET body is intentionally not forwarded (all SlidTodo DELETE/GET endpoints are body-less)
  const hasBody = req.method === 'POST' || req.method === 'PATCH';
  const body = hasBody ? await req.text() : undefined;
  const contentType = req.headers.get('content-type') ?? undefined;

  // access 쿠키가 있으면 우선 시도하고, 401이 아니면 그대로 통과시킨다.
  // access 쿠키가 없으면(예: 사용자가 devtools로 직접 삭제) 첫 호출을 건너뛰고
  // 곧장 refresh 경로로 진입해 silent 재발급을 시도한다.
  if (access) {
    const first = await callExternal({
      method: req.method as HttpMethod,
      path: joined,
      search,
      accessToken: access,
      body,
      contentType,
    });
    if (first.status !== 401) {
      return passthrough(first);
    }
  }

  const tokens = refresh ? await refreshTokens(refresh) : null;
  if (!tokens) {
    const out = NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    clearAuthCookies(out);
    return out;
  }

  // refresh가 성공하면 회전된 토큰은 유효하므로, 재시도가 또 401이어도
  // 회전된 쿠키를 set하고 upstream 응답(401 포함)을 그대로 전달한다
  // (다음 요청은 새 토큰을 사용; 여기서 추가 재시도/clear는 하지 않는다).
  const retry = await callExternal({
    method: req.method as HttpMethod,
    path: joined,
    search,
    accessToken: tokens.accessToken,
    body,
    contentType,
  });
  const out = passthrough(retry);
  setAuthCookies(out, tokens);
  return out;
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
