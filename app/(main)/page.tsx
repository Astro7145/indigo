'use client';

import { useState } from 'react';

import GoalTodoSection from '@/src/components/goal/GoalTodoSection';
import ProgressCard from '@/src/components/goal/ProgressCard';
import RecentTodos from '@/src/components/todo/RecentTodos';
import TodoDetailSheet from '@/src/components/todo/TodoDetailSheet';
import TodoFormSheet from '@/src/components/todo/TodoFormSheet';
import { useMe } from '@/src/hooks/user';
import type { Todo } from '@/src/types/todo';

export default function DashboardPage() {
  const { data: me } = useMe();
  // 대시보드 내 모든 섹션(RecentTodos·GoalTodoBoard)이 공유하는 단일 폼 상태.
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [creatingForGoalId, setCreatingForGoalId] = useState<number | null>(null);
  // 상세 시트로 열려 있는 할일. null이면 시트가 닫힌다.
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  return (
    <>
      <div id="toast-portal" />
      <div className="mx-auto flex w-full max-w-328 flex-col gap-10 sm:my-3 sm:gap-8">
        {/* 모바일(<sm)은 GNB가 타이틀을 담당 → sm+ 에서 노출. me.name 로드 전후 grid가 밀려나지 않도록 h-8(text-2xl 줄높이) 예약 */}
        <div className="hidden h-8 sm:block">
          <h1 className="pl-1 text-2xl font-semibold text-slate-800">
            <span data-testid="user-name" className="text-indigo-600">
              {me?.name}
            </span>
            님의 대시보드
          </h1>
        </div>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-3 xl:gap-8">
          <RecentTodos onEditTodo={setEditingTodo} onSelectTodo={setSelectedTodo} />
          <ProgressCard />
        </div>
        <GoalTodoSection onEditTodo={setEditingTodo} onAddTodo={setCreatingForGoalId} onSelectTodo={setSelectedTodo} />
        <TodoFormSheet
          mode="update"
          isOpen={editingTodo !== null}
          onClose={() => setEditingTodo(null)}
          todo={editingTodo}
        />
        <TodoFormSheet
          mode="create"
          isOpen={creatingForGoalId !== null}
          onClose={() => setCreatingForGoalId(null)}
          defaultGoalId={creatingForGoalId ?? undefined}
        />
        <TodoDetailSheet isOpen={selectedTodo !== null} onClose={() => setSelectedTodo(null)} todo={selectedTodo} />
      </div>
    </>
  );
}
