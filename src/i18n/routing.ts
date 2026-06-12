// 쿠키 기반(no-routing) i18n — URL에 locale 세그먼트를 두지 않으므로
// next-intl의 defineRouting/미들웨어 대신 locale 목록과 검증 유틸만 둔다.

// 지원할 언어 목록
export const locales = ['en', 'jp', 'ko'] as const;

export type Locale = (typeof locales)[number];

// 기본 언어 (쿠키가 없거나 유효하지 않을 때 사용)
export const defaultLocale: Locale = 'ko';

export const isValidLocale = (locale: string): locale is Locale => (locales as readonly string[]).includes(locale);
