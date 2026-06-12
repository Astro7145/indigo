import { Suspense } from 'react';

import CalendarView from '@/src/components/todo/calendar/CalendarView';

/**
 * 캘린더 라우트(`/calendar`). 라우팅 전용 — `?goalId=` 프리셋은 본문이 useSearchParams로 직접 읽는다
 * (서버가 prop으로 주입하면 뒤로가기 시 라우터 캐시의 옛 prop과 현재 URL이 어긋난다).
 * useSearchParams를 쓰는 클라 본문은 Suspense로 감싸 정적 프리렌더를 유지한다.
 */
export default function CalendarPage() {
  return (
    <Suspense fallback={null}>
      <CalendarView />
    </Suspense>
  );
}
