import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';
import './globals.css';
import { getUnreadNotificationCount, notificationTitlePrefix } from '@/src/api/server/notification-count';
import ModalStack from '@/src/components/common/modal/ModalStack';
import Toast from '@/src/components/common/toast/Toast';
import Providers from './providers';

const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  weight: '100 900',
});

// 안 읽은 알림 개수를 title prefix로 붙인다(예: "(1) 캘린더 | INdigo"). 전역 template이라
// 모든 화면에 적용된다. 0이면 prefix 없음(비로그인은 serverGet 토큰이 없어 count 0).
export async function generateMetadata(): Promise<Metadata> {
  const prefix = notificationTitlePrefix(await getUnreadNotificationCount());
  return {
    title: {
      template: `${prefix}%s | INdigo`,
      default: `${prefix}대시보드 | INdigo`,
    },
    description:
      'INdigo는 할일·목표·노트·소통 게시판을 한곳에서 관리하는 생산성 서비스입니다. 흩어진 일정과 기록을 모아 목표 달성까지 함께합니다.',
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${pretendard.className} h-full antialiased`} suppressHydrationWarning>
      <body className="dark:bg-indigo-dark-400 flex min-h-full bg-slate-100">
        <NextIntlClientProvider>
          <Providers>
            <Toast />
            <ModalStack />
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
