'use client';

import { useEffect, useRef } from 'react';

import GoalTodoBoard from '@/src/components/goal/GoalTodoBoard';
import { IcGoal } from '@/src/components/common/icons/IcGoal';
import { useInfiniteGoalList } from '@/src/hooks/goal';
import { cn } from '@/src/utils/cn';

export interface GoalTodoSectionProps {
  className?: string;
}

/**
 * "목표 별 할일" 섹션. 목표를 2개씩 무한 스크롤로 불러와 GoalTodoBoard로 렌더한다.
 * 목표가 0개면 섹션 자체를 렌더하지 않는다(기획 SSOT).
 */
export default function GoalTodoSection({ className }: GoalTodoSectionProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteGoalList({ limit: 2 });
  const goals = data?.pages.flatMap((p) => p.goals) ?? [];
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextPage();
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (goals.length === 0) return null;

  return (
    <section aria-label="목표 별 할일" className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center gap-3 px-2">
        <IcGoal aria-hidden className="shrink-0" />
        <h2 className="text-lg leading-7 font-medium text-black">목표 별 할일</h2>
      </div>
      <div className="flex flex-col gap-6">
        {goals.map((goal) => (
          <GoalTodoBoard key={goal.id} goal={goal} />
        ))}
      </div>
      {hasNextPage && <div ref={sentinelRef} aria-hidden className="h-1 w-full" />}
      {isFetchingNextPage && <p className="py-3 text-center text-sm text-slate-400">불러오는 중…</p>}
    </section>
  );
}
