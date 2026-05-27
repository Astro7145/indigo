'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';

import Card from '@/src/components/common/cards/Card';
import SearchInput from '@/src/components/common/inputs/SearchInput';
import Button from '@/src/components/common/buttons/Button';
import IconButton from '@/src/components/common/buttons/IconButton';
import TodoList from '@/src/components/common/todo-list/TodoList';
import { IcPlus } from '@/src/components/common/icons/IcPlus';
import { useTodoList, useUpdateTodo } from '@/src/hooks/todo';
import { useAddTodoFavorite, useRemoveTodoFavorite } from '@/src/hooks/favorite';
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

function Row({
  todo,
  onToggle,
  onToggleFavorite,
}: {
  todo: Todo;
  onToggle: (id: number, done: boolean) => void;
  onToggleFavorite: (id: number, isFavorite: boolean) => void;
}) {
  return (
    <li>
      <TodoList title={todo.title} checked={todo.done} onCheckedChange={(done) => onToggle(todo.id, done)}>
        <TodoList.Actions>
          {todo.noteIds.length > 0 && <TodoList.NoteAction />}
          {todo.linkUrl && <TodoList.LinkAction />}
          <TodoList.KebabAction hoverOnly />
          <TodoList.StarAction active={todo.isFavorite} onClick={() => onToggleFavorite(todo.id, todo.isFavorite)} />
        </TodoList.Actions>
      </TodoList>
    </li>
  );
}

function Column({
  label,
  todos,
  onToggle,
  onToggleFavorite,
}: {
  label: 'To do' | 'Done';
  todos: Todo[];
  onToggle: (id: number, done: boolean) => void;
  onToggleFavorite: (id: number, isFavorite: boolean) => void;
}) {
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
          <Row key={t.id} todo={t} onToggle={onToggle} onToggleFavorite={onToggleFavorite} />
        ))}
      </ul>
    </div>
  );
}

export default function GoalTodoBoard({ goal, className }: GoalTodoBoardProps) {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const { data, isLoading, isError } = useTodoList({ goalId: goal.id, keyword: keyword || undefined });
  const update = useUpdateTodo();
  const addFavorite = useAddTodoFavorite();
  const removeFavorite = useRemoveTodoFavorite();

  const reduce = useReducedMotion();

  const todos = data?.todos ?? [];
  const todoItems = todos.filter((t) => !t.done);
  const doneItems = todos.filter((t) => t.done);
  const percent = percentOf(goal.completedCount, goal.todoCount);

  const toggle = (id: number, done: boolean) => update.mutate({ todoId: id, body: { done } });
  const toggleFavorite = (id: number, isFavorite: boolean) =>
    isFavorite ? removeFavorite.mutate(id) : addFavorite.mutate(id);

  return (
    <Card
      onClick={() => router.push(`/goals/${goal.id}`)}
      className={cn(
        'flex cursor-pointer flex-col gap-5 border border-slate-200 p-7 transition-shadow hover:shadow-xl',
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          {/* 제목 행 — 모바일은 우측에 + 아이콘(태블릿+에선 숨기고 우측 텍스트 버튼 사용) */}
          <div className="flex items-center justify-between gap-2 sm:shrink-0 sm:justify-start">
            <h3 className="min-w-0 truncate text-lg font-medium text-slate-800">{goal.title}</h3>
            <IconButton
              aria-label="할일 추가"
              className="size-9 shrink-0 rounded-lg border border-indigo-500 sm:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <IcPlus className="size-4 text-indigo-600" />
            </IconButton>
          </div>
          {/* 진행바 + % */}
          <div className="flex flex-1 items-center gap-3">
            <div
              role="progressbar"
              aria-label={`${goal.title} 진행률`}
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2 w-full max-w-[310px] shrink overflow-hidden rounded-full bg-slate-200"
            >
              <motion.div
                className="h-full rounded-full bg-indigo-500"
                initial={reduce ? false : { width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1] }}
              />
            </div>
            <span className="shrink-0 text-sm font-semibold text-indigo-700">{percent}%</span>
          </div>
        </div>
        {/* 검색 + 할일 추가(텍스트) — 모바일은 검색만 전체폭, 텍스트 버튼은 태블릿+에서 노출 */}
        <div className="flex w-full items-center gap-2 sm:w-auto sm:shrink-0" onClick={(e) => e.stopPropagation()}>
          <SearchInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onSearch={() => setKeyword(input)}
            className="w-full sm:w-[240px]"
          />
          <Button
            variant="secondary"
            size="medium"
            startIcon={<IcPlus className="size-4 text-indigo-600" />}
            className="hidden shrink-0 whitespace-nowrap sm:inline-flex"
          >
            할일 추가
          </Button>
        </div>
      </div>

      {/* 카드 클릭(목표 상세 이동)이 본문 내 컨트롤 조작으로 트리거되지 않도록 차단 */}
      <div onClick={(e) => e.stopPropagation()}>
        {isLoading ? (
          <p className="py-10 text-center text-sm text-slate-400">불러오는 중…</p>
        ) : isError ? (
          <p className="py-10 text-center text-sm text-slate-400">불러오지 못했어요</p>
        ) : todos.length === 0 ? (
          keyword ? (
            <p className="py-10 text-center text-sm text-slate-500">검색 결과가 없어요</p>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8">
              <Image src="/images/empty-goal.svg" alt="" width={88} height={88} unoptimized aria-hidden />
              <p className="text-sm text-slate-500">아직 할 일이 없어요</p>
            </div>
          )
        ) : (
          <div className="flex flex-col gap-5 sm:flex-row">
            <Column label="To do" todos={todoItems} onToggle={toggle} onToggleFavorite={toggleFavorite} />
            <Column label="Done" todos={doneItems} onToggle={toggle} onToggleFavorite={toggleFavorite} />
          </div>
        )}
      </div>
    </Card>
  );
}
