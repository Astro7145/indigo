import { Suspense } from 'react';

import CalendarView from '@/src/components/todo/calendar/CalendarView';

/**
 * 캘린더 라우트(`/calendar`). 라우팅 전용 — 본문은 클라이언트 CalendarView에 위임한다.
 * useSearchParams(goalId 프리셋)를 쓰는 클라 본문을 Suspense로 감싸 정적 프리렌더를 유지한다.
 */
export default function CalendarPage() {
  return (
    <Suspense fallback={null}>
      <CalendarView />
    </Suspense>
  );
}
