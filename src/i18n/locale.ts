'use server';

// 쿠키 기반 locale 영속. URL을 바꾸지 않으므로 사용자가 고른 언어를
// HttpOnly가 아닌 일반 쿠키에 저장하고, 서버 컴포넌트(request.ts)가 이를 읽는다.
// 설정 모달 드롭다운과의 연결은 후속 단계에서 setUserLocale를 호출해 배선한다.
import { cookies } from 'next/headers';
import { defaultLocale, isValidLocale, type Locale } from './routing';

const COOKIE_NAME = 'NEXT_LOCALE';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1y — 언어 설정은 장기 영속(세션 쿠키면 브라우저 종료 시 사라짐)

export async function getUserLocale(): Promise<Locale> {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  return value && isValidLocale(value) ? value : defaultLocale;
}

export async function setUserLocale(locale: Locale) {
  (await cookies()).set(COOKIE_NAME, locale, {
    maxAge: COOKIE_MAX_AGE,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  });
}
