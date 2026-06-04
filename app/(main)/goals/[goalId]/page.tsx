import { notFound } from 'next/navigation';

import GoalDetail from '@/src/components/goal/GoalDetail';

/**
 * 목표 상세 라우트(`/goals/[goalId]`). 라우팅 전용 — params를 파싱해 클라이언트 본문에 위임한다.
 * (main) 그룹 셸 레이아웃(사이드바/GNB placeholder)을 상속한다.
 */
export default async function GoalDetailPage({ params }: { params: Promise<{ goalId: string }> }) {
  const { goalId } = await params;
  const id = Number(goalId);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <GoalDetail goalId={id} />;
}
