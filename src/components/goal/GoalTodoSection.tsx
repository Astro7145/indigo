'use client';

import { useEffect, useRef } from 'react';

import AsyncBoundary from '@/src/components/common/AsyncBoundary';
import GoalTodoBoard from '@/src/components/goal/GoalTodoBoard';
import Card from '@/src/components/common/cards/Card';
import { IcGoal } from '@/src/components/common/icons/IcGoal';
import { useInfiniteGoalListSuspense } from '@/src/hooks/goal';
import type { Todo } from '@/src/types/todo';
import { cn } from '@/src/utils/cn';

export interface GoalTodoSectionProps {
  className?: string;
  onEditTodo: (todo: Todo) => void;
  onAddTodo: (goalId: number) => void;
  onSelectTodo: (todo: Todo) => void;
}

/**
 * "목표 별 할일" 섹션. 목표를 2개씩 무한 스크롤로 불러와 GoalTodoBoard로 렌더한다.
 * 목표가 0개면 섹션 헤더와 함께 "등록한 목표가 없어요" 안내를 표시한다(일러스트 없음).
 */
export default function GoalTodoSection({ className, onEditTodo, onAddTodo, onSelectTodo }: GoalTodoSectionProps) {
  return (
    <section aria-label="목표 별 할일" className={cn('flex flex-col gap-2.5', className)}>
      <div className="flex items-center gap-3 px-2">
        <IcGoal aria-hidden className="size-8 shrink-0 xl:size-10" />
        <h2 className="text-base leading-6 font-medium text-black xl:text-lg xl:leading-7">목표 별 할일</h2>
      </div>
      <AsyncBoundary
        fallback={<p className="py-10 text-center text-sm text-slate-400">불러오는 중…</p>}
        errorFallback={<p className="py-10 text-center text-sm text-slate-400">불러오지 못했어요</p>}
      >
        <GoalTodoSectionBody onEditTodo={onEditTodo} onAddTodo={onAddTodo} onSelectTodo={onSelectTodo} />
      </AsyncBoundary>
    </section>
  );
}

function GoalTodoSectionBody({ onEditTodo, onAddTodo, onSelectTodo }: Omit<GoalTodoSectionProps, 'className'>) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError } = useInfiniteGoalListSuspense({
    limit: 2,
  });
  const goals = data.pages.flatMap((p) => p.goals);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    // 다음 페이지 fetch가 실패하면 sentinel을 관찰하지 않는다. 관찰하면 sentinel이 화면에 남아
    // 있는 한 IntersectionObserver가 즉시 다시 교차해 fetchNextPage를 무한 재호출(API 스팸)한다.
    if (!el || !hasNextPage || isFetchingNextPage || isFetchNextPageError) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextPage();
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  if (goals.length === 0) {
    // figma 21209:52456 — 카드 chrome 그대로(일러스트 제외). 텍스트 가운데 정렬용 min-h 확보.
    return (
      <Card className="flex min-h-[200px] items-center justify-center border border-slate-200 shadow-[0_2px_4px_0_rgba(0,0,0,0.04)]">
        <p className="text-md m-auto text-center text-slate-500">등록한 목표가 없어요</p>
      </Card>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6 xl:gap-8">
        {goals.map((goal) => (
          <GoalTodoBoard
            key={goal.id}
            goal={goal}
            onEditTodo={onEditTodo}
            onAddTodo={onAddTodo}
            onSelectTodo={onSelectTodo}
          />
        ))}
      </div>
      {hasNextPage && <div ref={sentinelRef} aria-hidden className="h-1 w-full" />}
      {isFetchingNextPage && <p className="py-3 text-center text-sm text-slate-400">불러오는 중…</p>}
    </>
  );
}
