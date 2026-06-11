'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import AsyncBoundary from '@/src/components/common/AsyncBoundary';
import Button from '@/src/components/common/buttons/Button';
import TodoList from '@/src/components/common/todo-list/TodoList';
import { IcCalendar } from '@/src/components/common/icons/IcCalendar';
import { IcPlus } from '@/src/components/common/icons/IcPlus';
import { useInfiniteTodoList } from '@/src/hooks/todo';
import { useTodoSheet } from '@/src/hooks/useTodoSheet';
import type { Todo } from '@/src/types/todo';
import { cn } from '@/src/utils/cn';

export interface GoalTodoColumnProps {
  goalId: number;
  /** true=완료한 일(Done), false=해야 할 일(To do) */
  done: boolean;
  className?: string;
}

/**
 * 목표 상세의 한 컬럼(To do 또는 Done). 목표에 속한 할 일을 `done` 필터로 무한 스크롤 조회한다.
 *
 * 컬럼마다 독립된 스크롤 영역과 무한 쿼리를 가진다(시안의 분리된 스크롤 컬럼과 일치).
 * 행 아이콘(링크/노트 인디케이터·즐겨찾기)은 `/todos` 응답 필드를 쓰므로 useInfiniteTodoList로 조회.
 *
 * 행 클릭·케밥(수정/삭제)·`할 일 추가`는 호출 측(GoalDetail)이 소유한 시트로 연결된다(콜백 props).
 * `캘린더 보기`는 목표 필터가 프리셋된 `/calendar?goalId=`로 이동한다. Figma 21209:54510(To do) / 21209:54528(Done).
 */
export default function GoalTodoColumn({ goalId, done, className }: GoalTodoColumnProps) {
  const label = done ? 'DONE' : 'TO DO';
  const router = useRouter();
  const { openCreate } = useTodoSheet();

  return (
    <section aria-label={label} className={cn('flex min-w-0 flex-col gap-2.5', className)}>
      {/* 헤더는 두 컬럼 모두 40px로 통일 — To do의 버튼(40px)과 Done의 라벨 본문 상단이 같은 높이에서 시작하도록 */}
      <div className="flex h-10 items-center justify-between px-2">
        <h3 className="text-lg font-semibold tracking-[-0.03em] text-slate-800">{label}</h3>
        {/* To do 컬럼에만 노출 — 할 일 추가는 생성 시트로, 캘린더 보기는 목표 필터 프리셋 캘린더로 */}
        {!done && (
          <div className="flex items-center gap-2">
            <Button
              variant="tertiary"
              size="small"
              startIcon={<IcCalendar className="size-5" />}
              className="h-10 whitespace-nowrap"
              onClick={() => router.push(`/calendar?goalId=${goalId}`)}
            >
              캘린더 보기
            </Button>
            <Button
              variant="primary"
              size="small"
              startIcon={<IcPlus className="size-5 text-white" />}
              className="h-10 whitespace-nowrap"
              onClick={() => openCreate({ goalId })}
            >
              할 일 추가
            </Button>
          </div>
        )}
      </div>

      {/* 본문 카드 — 데스크톱(xl)에선 두 컬럼이 동일한 높이의 큰 카드(시안). 그 이하는 내용 높이. */}
      <div
        className={cn(
          'flex flex-col rounded px-7 py-8 xl:h-[576px]',
          done ? 'bg-white shadow-[0_2px_8px_0_rgba(0,0,0,0.04)]' : 'bg-indigo-100',
        )}
      >
        <AsyncBoundary
          fallback={
            <p className="flex flex-1 items-center justify-center py-16 text-center text-sm text-slate-400">
              불러오는 중…
            </p>
          }
          errorFallback={
            <p className="flex flex-1 items-center justify-center py-16 text-center text-sm text-slate-400">
              불러오지 못했어요
            </p>
          }
        >
          <GoalTodoColumnContent goalId={goalId} done={done} />
        </AsyncBoundary>
      </div>
    </section>
  );
}

function GoalTodoColumnContent({ goalId, done }: Pick<GoalTodoColumnProps, 'goalId' | 'done'>) {
  const { openEdit, openDetail } = useTodoSheet();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError } = useInfiniteTodoList({
    goalId,
    done: done ? 'true' : 'false',
  });

  const scrollRef = useRef<HTMLUListElement>(null);
  const sentinelRef = useRef<HTMLLIElement>(null);

  const todos = data.pages.flatMap((p) => p.todos);

  useEffect(() => {
    const el = sentinelRef.current;
    const root = scrollRef.current;
    // 다음 페이지 fetch 실패 시 sentinel을 관찰하지 않는다 — 관찰하면 화면에 남은 sentinel이
    // 즉시 다시 교차해 fetchNextPage를 무한 재호출(API 스팸)한다.
    if (!el || !root || !hasNextPage || isFetchingNextPage || isFetchNextPageError) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextPage();
      },
      { root, rootMargin: '120px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage, todos.length]);

  if (todos.length === 0) {
    return (
      <p className="flex flex-1 items-center justify-center py-16 text-center text-sm text-slate-500">
        {done ? '완료한 일이 아직 없어요' : '해야할 일이 아직 없어요'}
      </p>
    );
  }

  return (
    <TodoList
      ref={scrollRef}
      className="scrollbar-slate flex max-h-[420px] flex-1 flex-col gap-1 overflow-y-auto xl:max-h-none"
      todos={todos}
      size="large"
      onEdit={openEdit}
      onSelect={openDetail}
    >
      {hasNextPage && <li ref={sentinelRef} aria-hidden className="h-1 shrink-0" />}
      {isFetchingNextPage && <li className="py-3 text-center text-sm text-slate-400">불러오는 중…</li>}
    </TodoList>
  );
}
