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
