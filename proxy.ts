import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { COOKIE } from '@/src/api/server/auth-cookies';
import { isValidLocale, routing } from '@/src/i18n/routing';

const handleI18nRouting = createMiddleware(routing);

// 인증 페이지(비로그인 사용자에게 허용, 로그인 사용자는 진입 시 홈으로 돌려보냄)
const AUTH_PAGES = ['/login', '/signup'];

// /ko/login → /login : 로케일 prefix를 떼고 순수 경로로 비교한다
function stripLocale(pathname: string) {
  const [, maybeLocale, ...rest] = pathname.split('/');
  if (isValidLocale(maybeLocale)) {
    return '/' + rest.join('/');
  }
  return pathname;
}

/**
 * 인증 상태 기반 라우팅 가드 + i18n 라우팅 (Next.js 16 proxy 컨벤션).
 *
 * 토큰은 HttpOnly 쿠키로 서버가 보유하므로, 페이지 렌더 전 Edge에서 로그인 여부를
 * 판단해 클라이언트 깜빡임(비로그인 시 대시보드가 잠깐 보였다 사라짐)을 없앤다.
 *
 * 성능상 백엔드 토큰 검증은 하지 않고 refresh_token 쿠키 "존재 여부"만 본다.
 * refresh 쿠키는 maxAge가 있어 만료 시 브라우저가 삭제하므로 존재=로그인 신호로 충분하다.
 * "쿠키는 살아있으나 서버에서 무효"인 드문 경우는 client-fetcher 인터셉터가 폴백 처리.
 *
 * localePrefix가 'always'라 경로에 로케일이 붙으므로(`/ko/login`), auth 비교 전에
 * stripLocale로 prefix를 떼고, 인증 통과 시 최종 응답은 next-intl 미들웨어에 위임한다.
 */
export function proxy(req: NextRequest) {
  const isAuthed = Boolean(req.cookies.get(COOKIE.REFRESH)?.value);
  const pathname = stripLocale(req.nextUrl.pathname);
  const isAuthPage = AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  // 비로그인 + 보호 페이지 → 로그인으로.
  // 원래 가려던 경로(쿼리 포함)를 callbackUrl로 넘겨 로그인 후 복귀시킨다.
  if (!isAuthed && !isAuthPage) {
    const url = new URL('/login', req.url);
    url.searchParams.set('callbackUrl', pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // 로그인 + 인증 페이지 → 홈으로 (역방향)
  if (isAuthed && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // 인증 통과 → i18n 라우팅이 최종 응답(로케일 감지·리다이렉트·쿠키·헤더)을 처리
  return handleI18nRouting(req);
}

export const config = {
  // / 와 모든 로케일 경로를 포함. api·_next·_vercel·favicon·확장자 있는 정적 파일 제외
  matcher: ['/((?!api|_next|_vercel|favicon.ico|.*\\..*).*)'],
};
