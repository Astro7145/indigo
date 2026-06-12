import Link from 'next/link';
import { Logo } from '@/src/components/common/icons/Logo';

/**
 * 전역 404 페이지
 *
 * 루트 not-found는 locale 세그먼트 밖에서 렌더링되어 next-intl 컨텍스트가 없으므로
 * 기본 언어(한국어) 정적 텍스트로 표기한다.
 */
export default function NotFound() {
  return (
    <html lang="ko">
      <body>
        <main className="flex min-h-screen w-full flex-col items-center justify-center gap-6 px-4 text-center">
          <Logo size="lg" aria-hidden />

          <p className="text-display-xl font-bold tracking-[-0.03em] text-indigo-500">404</p>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-slate-800">페이지를 찾을 수 없어요</h1>
            <p className="text-base text-slate-500">
              주소가 잘못 입력되었거나, 페이지가 이동 또는 삭제되었을 수 있어요.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded border border-transparent bg-indigo-600 px-4.5 py-2.75 text-base font-semibold tracking-[-0.03em] text-white transition-colors select-none hover:bg-indigo-700"
          >
            홈으로 돌아가기
          </Link>
        </main>
      </body>
    </html>
  );
}
