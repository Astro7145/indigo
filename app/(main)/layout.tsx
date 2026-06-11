import { cookies } from 'next/headers';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { prefetchMe } from '@/src/api/server/prefetch';
import { getQueryClient } from '@/src/api/server/query-client';
import Sidebar from '@/src/components/common/sidebar/Sidebar';
import Topbar from '@/src/components/common/sidebar/Topbar';
import Settings from '@/src/components/common/settings/Settings';

/**
 * (main) 그룹 레이아웃. 전 페이지가 쓰는 useMe(타이틀·사이드바 프로필)를 서버에서 prefetch한다(#136).
 * cookies()를 읽으므로 (main) 전 라우트는 동적(ƒ) — 전 쿼리 prefetch 커버의 의도된 비용.
 */
export default async function MainLayout({ children }: { children: React.ReactNode }) {
  // 빌드 프리렌더 차단 신호를 prefetch보다 먼저 — queryFn 안의 cookies()가 던지는 dynamic bail-out은
  // TanStack prefetch가 에러로 삼켜 렌더러에 닿지 않고, 정적 프리렌더가 계속 진행돼 빌드가 깨진다.
  // 레이아웃 본문에서 직접 읽어 (main) 전 라우트를 요청 시 렌더(ƒ)로 확정한다.
  await cookies();

  const qc = getQueryClient();
  await prefetchMe(qc);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <div className="flex min-h-screen w-full flex-col bg-slate-100 sm:flex-row">
        <Topbar />
        <Sidebar />
        <Settings />
        <div className="flex flex-1 flex-col">
          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-12 xl:px-10 xl:py-20">{children}</main>
          <div id="toast-portal" />
        </div>
      </div>
    </HydrationBoundary>
  );
}
