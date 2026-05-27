'use client';

import { useState } from 'react';
import Image from 'next/image';

import Card from '@/src/components/common/cards/Card';
import SearchInput from '@/src/components/common/inputs/SearchInput';
import Button from '@/src/components/common/buttons/Button';
import TodoList from '@/src/components/common/todo-list/TodoList';
import { IcPlus } from '@/src/components/common/icons/IcPlus';
import { useTodoList } from '@/src/hooks/todo';
import type { GoalListItem } from '@/src/types/goal';
import type { Todo } from '@/src/types/todo';
import { cn } from '@/src/utils/cn';

export interface GoalTodoBoardProps {
  goal: GoalListItem;
  className?: string;
}

function percentOf(done: number, total: number): number {
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

function Row({ todo }: { todo: Todo }) {
  return (
    <li>
      <TodoList title={todo.title} checked={todo.done}>
        <TodoList.Actions>
          {todo.noteIds.length > 0 && <TodoList.NoteAction />}
          {todo.linkUrl && <TodoList.LinkAction />}
          <TodoList.KebabAction hoverOnly />
          <TodoList.StarAction active={todo.isFavorite} />
        </TodoList.Actions>
      </TodoList>
    </li>
  );
}

function Column({ label, todos }: { label: 'To do' | 'Done'; todos: Todo[] }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex min-w-0 flex-1 flex-col gap-2 rounded border border-slate-200 p-5"
    >
      <span
        className={cn(
          'text-sm font-semibold tracking-[-0.03em]',
          label === 'To do' ? 'text-indigo-700' : 'text-slate-500',
        )}
      >
        {label === 'To do' ? 'TO DO' : 'DONE'}
      </span>
      <ul className="scrollbar-slate flex max-h-60 flex-col gap-1.5 overflow-y-auto">
        {todos.map((t) => (
          <Row key={t.id} todo={t} />
        ))}
      </ul>
    </div>
  );
}

export default function GoalTodoBoard({ goal, className }: GoalTodoBoardProps) {
  const [keyword, setKeyword] = useState('');
  const { data } = useTodoList({ goalId: goal.id, keyword: keyword || undefined });
  const todos = data?.todos ?? [];
  const todoItems = todos.filter((t) => !t.done);
  const doneItems = todos.filter((t) => t.done);
  const percent = percentOf(goal.completedCount, goal.todoCount);

  return (
    <Card
      className={cn('flex flex-col gap-5 border border-slate-200 p-7 transition-shadow hover:shadow-xl', className)}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <h3 className="shrink-0 text-lg font-medium text-slate-800">{goal.title}</h3>
          <div className="flex flex-1 items-center gap-2">
            <div
              role="progressbar"
              aria-label={`${goal.title} 진행률`}
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2 w-full max-w-[310px] overflow-hidden rounded-full bg-slate-200"
            >
              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${percent}%` }} />
            </div>
            <span className="shrink-0 text-sm font-semibold text-indigo-700">{percent}%</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <SearchInput value={keyword} onChange={(e) => setKeyword(e.target.value)} className="w-full lg:w-[240px]" />
          <Button variant="secondary" size="small" startIcon={<IcPlus />} className="shrink-0">
            할일 추가
          </Button>
        </div>
      </div>

      {todos.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10">
          <Image src="/images/empty-goal.png" alt="" width={120} height={120} aria-hidden />
          <p className="text-sm text-slate-500">아직 할 일이 없어요</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5 lg:flex-row">
          <Column label="To do" todos={todoItems} />
          <Column label="Done" todos={doneItems} />
        </div>
      )}
    </Card>
  );
}
