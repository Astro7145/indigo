import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE } from '@/src/api/server/auth-cookies';

// 인증 페이지(비로그인 사용자에게 허용, 로그인 사용자는 진입 시 홈으로 돌려보냄)
const AUTH_PAGES = ['/login', '/signup'];

/**
 * 인증 상태 기반 라우팅 가드 (Next.js 16 proxy 컨벤션).
 *
 * 토큰은 HttpOnly 쿠키로 서버가 보유하므로, 페이지 렌더 전 Edge에서 로그인 여부를
 * 판단해 클라이언트 깜빡임(비로그인 시 대시보드가 잠깐 보였다 사라짐)을 없앤다.
 *
 * 성능상 백엔드 토큰 검증은 하지 않고 refresh_token 쿠키 "존재 여부"만 본다.
 * refresh 쿠키는 maxAge가 있어 만료 시 브라우저가 삭제하므로 존재=로그인 신호로 충분하다.
 * "쿠키는 살아있으나 서버에서 무효"인 드문 경우는 client-fetcher 인터셉터가 폴백 처리.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAuthed = Boolean(req.cookies.get(COOKIE.REFRESH)?.value);
  const isAuthPage = AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  // 비로그인 + 보호 페이지 → 로그인으로
  if (!isAuthed && !isAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 로그인 + 인증 페이지 → 홈으로 (역방향)
  if (isAuthed && isAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // /api(BFF가 자체 인증), _next 내부 리소스, favicon, 확장자 있는 정적 파일 제외
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
