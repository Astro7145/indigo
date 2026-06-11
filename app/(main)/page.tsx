import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { prefetchDashboard } from '@/src/api/server/prefetch';
import { getQueryClient } from '@/src/api/server/query-client';
import GoalTodoSection from '@/src/components/goal/GoalTodoSection';
import ProgressCard from '@/src/components/goal/ProgressCard';
import RecentTodos from '@/src/components/todo/RecentTodos';
import DashboardTitle from '@/src/components/user/DashboardTitle';

/**
 * 대시보드 라우트(`/`). 서버 셸 — 핵심 쿼리를 prefetch해 하이드레이션하고(#136),
 * 본문은 클라 섹션 컴포넌트들을 직접 합성한다(시트는 전역 모달 스택이 담당).
 */
export default async function DashboardPage() {
  const qc = getQueryClient();
  await prefetchDashboard(qc);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <div id="toast-portal" />
      <div className="mx-auto flex w-full max-w-328 flex-col gap-10 sm:my-3 sm:gap-8">
        <DashboardTitle />
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-3 xl:gap-8">
          <RecentTodos />
          <ProgressCard />
        </div>
        <GoalTodoSection />
      </div>
    </HydrationBoundary>
  );
}
