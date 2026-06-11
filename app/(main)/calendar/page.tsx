import CalendarView from '@/src/components/todo/calendar/CalendarView';

/**
 * 캘린더 라우트(`/calendar`). 라우팅 전용 — searchParams의 `goalId` 프리셋을 파싱해 클라 본문에 위임한다.
 * 서버에서 searchParams를 읽으므로 라우트는 동적(ƒ)이다 — 이 페이지의 정적 셸은 어차피 로딩 fallback뿐이라
 * 포기 비용이 없고, 추후 SSR prefetch(#136)가 들어오면 여기서 goalId 기반 prefetch로 확장한다.
 * `key`로 프리셋 변경(같은 라우트 내 쿼리 이동 포함) 시 본문을 리마운트해 필터 초기값이 항상 URL과 일치한다.
 */
export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ goalId?: string }> }) {
  const { goalId: raw } = await searchParams;
  // 잘못된 값(비정수·0 이하)은 전체 목표로 무시
  const n = Number(raw);
  const goalId = raw !== undefined && Number.isInteger(n) && n > 0 ? n : undefined;
  return <CalendarView key={goalId ?? 'all'} initialGoalId={goalId} />;
}
