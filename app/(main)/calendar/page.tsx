import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { startOfMonth, today } from '@internationalized/date';

import { prefetchCalendarMonth } from '@/src/api/server/prefetch';
import { getQueryClient } from '@/src/api/server/query-client';
import CalendarView from '@/src/components/todo/calendar/CalendarView';

/**
 * 캘린더 라우트(`/calendar`). 서버 셸 — `?goalId=` 프리셋은 본문이 useSearchParams로 직접 읽는다
 * (서버가 prop으로 주입하면 뒤로가기 시 라우터 캐시의 옛 prop과 현재 URL이 어긋난다).
 */
export default async function CalendarPage() {
  const qc = getQueryClient();
  // 초기 보이는 달의 그리드 범위 prefetch — 서버 타임존이 아니라 서비스 기준(KST)으로 고정해
  // 클라(useTodosInRange) 쿼리 키와 어긋나지 않게 한다 (#136)
  await prefetchCalendarMonth(qc, startOfMonth(today('Asia/Seoul')));

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <CalendarView />
    </HydrationBoundary>
  );
}
