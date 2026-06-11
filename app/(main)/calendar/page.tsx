import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getLocalTimeZone, startOfMonth, today } from '@internationalized/date';

import { prefetchCalendarMonth } from '@/src/api/server/prefetch';
import { getQueryClient } from '@/src/api/server/query-client';
import CalendarView from '@/src/components/todo/calendar/CalendarView';

/**
 * 캘린더 라우트(`/calendar`). 서버 셸 — `?goalId=` 프리셋은 본문이 useSearchParams로 직접 읽는다
 * (서버가 prop으로 주입하면 뒤로가기 시 라우터 캐시의 옛 prop과 현재 URL이 어긋난다).
 */
export default async function CalendarPage() {
  const qc = getQueryClient();
  // 초기 보이는 달(서버 기준 오늘)의 그리드 범위 prefetch — 클라 useTodosInRange와 동일 키 (#136)
  await prefetchCalendarMonth(qc, startOfMonth(today(getLocalTimeZone())));

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <CalendarView />
    </HydrationBoundary>
  );
}
