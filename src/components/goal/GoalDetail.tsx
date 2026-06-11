'use client';

import { useState } from 'react';

import AsyncBoundary from '@/src/components/common/AsyncBoundary';
import ProgressCard from '@/src/components/goal/ProgressCard';
import GoalDetailHeader from '@/src/components/goal/GoalDetailHeader';
import GoalNotesCard from '@/src/components/goal/GoalNotesCard';
import GoalTodoColumn from '@/src/components/goal/GoalTodoColumn';
import TodoDetailSheet from '@/src/components/todo/TodoDetailSheet';
import TodoFormSheet from '@/src/components/todo/TodoFormSheet';
import { useMe } from '@/src/hooks/user';
import type { Todo } from '@/src/types/todo';

export interface GoalDetailProps {
  goalId: number;
}

/**
 * 목표 상세 페이지 본문 — 상단 3카드(목표 정보 / 진행도 / 노트 모아보기)와
 * 본문 2컬럼(To do / Done) 보드를 조합한다.
 *
 * - 진행도: `ProgressCard`(goalId 변형 — 해당 목표 todos 완료 비율) 재사용
 * - 반응형: 모바일 세로 스택 → 태블릿(sm) 진행도·노트 2열 → 데스크톱(xl) 전체 가로 배치
 */
export default function GoalDetail({ goalId }: GoalDetailProps) {
  const { data: me } = useMe();

  // 두 컬럼(To do/Done)이 공유하는 단일 시트 상태. goalId가 고정이라 생성은 boolean으로 충분.
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [creating, setCreating] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  return (
    <div className="mx-auto flex w-full max-w-328 flex-col gap-8">
      {/* 모바일(<sm)은 GNB가 타이틀을 담당 → sm+에서 노출. 로드 전후 레이아웃 시프트 방지로 h-8 예약 */}
      <div className="hidden h-8 sm:block">
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-slate-800">{`${me?.name ?? ''}님의 목표`}</h1>
      </div>

      <AsyncBoundary
        fallback={<section className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-8" aria-hidden />}
        errorFallback={
          <div className="mx-auto w-full max-w-328 py-20 text-center text-slate-500">목표 정보를 불러오지 못했어요</div>
        }
      >
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-8">
          <GoalDetailHeader goalId={goalId} className="min-w-0" />
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            <ProgressCard
              goalId={goalId}
              className="w-full min-w-0 shadow-[0_8px_12px_0_rgba(61,54,119,0.25)] transition-shadow hover:shadow-[0_12px_20px_0_rgba(61,54,119,0.35)]"
            />
            <GoalNotesCard goalId={goalId} className="w-full min-w-0" />
          </div>
        </section>
      </AsyncBoundary>

      {/* 본문 2컬럼 — To do / Done. grid로 균등 분할(xl) */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2 xl:gap-8">
        <GoalTodoColumn
          goalId={goalId}
          done={false}
          onEditTodo={setEditingTodo}
          onAddTodo={() => setCreating(true)}
          onSelectTodo={setSelectedTodo}
        />
        <GoalTodoColumn
          goalId={goalId}
          done
          onEditTodo={setEditingTodo}
          onAddTodo={() => setCreating(true)}
          onSelectTodo={setSelectedTodo}
        />
      </div>

      <TodoFormSheet
        mode="update"
        isOpen={editingTodo !== null}
        onClose={() => setEditingTodo(null)}
        todo={editingTodo}
      />
      <TodoFormSheet mode="create" isOpen={creating} onClose={() => setCreating(false)} defaultGoalId={goalId} />
      <TodoDetailSheet isOpen={selectedTodo !== null} onClose={() => setSelectedTodo(null)} todo={selectedTodo} />
    </div>
  );
}
