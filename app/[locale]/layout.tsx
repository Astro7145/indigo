import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { isValidLocale } from '@/src/i18n/routing';

/**
 * locale 검증 + i18n 클라이언트 컨텍스트 공급 레이아웃.
 *
 * - 루트 레이아웃에서는 notFound() 호출이 금지되어 있으므로
 *   (전역 not-found 페이지를 감쌀 상위 레이아웃이 없어짐),
 *   locale 검증은 이 중첩 레이아웃에서 수행한다.
 * - NextIntlClientProvider는 클라이언트 컴포넌트의 useTranslations에
 *   Context를 공급한다. 서버 컴포넌트 안에서 렌더링하므로 locale·messages를
 *   request config에서 자동 상속받는다 (next-intl v4).
 */
export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // 유효하지 않은 locale이면 404
  if (!isValidLocale(locale)) {
    notFound();
  }

  return <NextIntlClientProvider>{children}</NextIntlClientProvider>;
}
