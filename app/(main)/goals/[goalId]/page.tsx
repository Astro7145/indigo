import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { prefetchGoalDetail, prefetchInfiniteTodos } from '@/src/api/server/prefetch';
import { getQueryClient } from '@/src/api/server/query-client';
import GoalDetail from '@/src/components/goal/GoalDetail';

// 메타데이터는 layout이 아닌 page에 둔다 — 컨테이너 layout이 문자열 title을 가지면
// 루트 title.template이 하위 화면(notes 등)까지 전파되지 못하고 끊긴다.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('goals');
  return { title: t('meta.title'), description: t('meta.description') };
}

/**
 * 목표 상세 라우트(`/goals/[goalId]`). 라우팅 전용 — params를 파싱해 클라이언트 본문에 위임한다.
 * (main) 그룹 셸 레이아웃(사이드바/GNB placeholder)을 상속한다.
 */
export default async function GoalDetailPage({ params }: { params: Promise<{ goalId: string }> }) {
  const { goalId } = await params;
  const id = Number(goalId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const qc = getQueryClient();
  // 목표 헤더·진행도와 To do/Done 두 컬럼의 첫 페이지를 prefetch
  await Promise.all([
    prefetchGoalDetail(qc, id),
    prefetchInfiniteTodos(qc, { goalId: id, done: 'false' }),
    prefetchInfiniteTodos(qc, { goalId: id, done: 'true' }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <GoalDetail goalId={id} />
    </HydrationBoundary>
  );
}
