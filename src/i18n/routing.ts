import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // 지원할 언어 목록
  locales: ['en', 'jp', 'ko'],

  // 기본 언어 (브라우저 언어가 목록에 없을 때 사용)
  defaultLocale: 'ko',
});

export const isValidLocale = (locale: string) => routing.locales.includes(locale as 'en' | 'jp' | 'ko');
