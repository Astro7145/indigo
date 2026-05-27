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
      <TodoList
        size="responsive"
        title={todo.title}
        checked={todo.done}
        onCheckedChange={(done) => onToggle(todo.id, done)}
      >
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
  const isTodo = label === 'To do';
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        // 컨테이너(카드) 폭 기준: <1024 compact(p-4·gap-2·auto 높이), ≥1024 spacious(p-6·gap-4·고정 324)
        'flex min-w-0 flex-col gap-2 overflow-hidden rounded border border-slate-200 p-4 @min-[600px]:flex-1 @min-[1024px]:h-[324px] @min-[1024px]:gap-4 @min-[1024px]:p-6',
        // figma: To Do = slate-50 배경(그림자 없음), Done = 흰 배경 + 옅은 그림자
        isTodo ? 'bg-slate-50' : 'bg-white shadow-[0_2px_8px_0_rgba(0,0,0,0.04)]',
      )}
    >
      <span
        className={cn(
          'px-1 text-sm font-semibold tracking-[-0.03em] @min-[1024px]:px-2 @min-[1024px]:text-base @min-[1024px]:font-bold',
          isTodo ? 'text-indigo-700' : 'text-slate-400',
        )}
      >
        {isTodo ? 'TO DO' : 'DONE'}
      </span>
      <ul className="scrollbar-slate flex flex-col gap-0.5 @min-[1024px]:flex-1 @min-[1024px]:gap-1 @min-[1024px]:overflow-y-auto">
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
        '@container flex cursor-pointer flex-col gap-4 border border-slate-200 px-8 py-6 shadow-[0_2px_4px_0_rgba(0,0,0,0.04)] transition-shadow hover:shadow-lg',
        className,
      )}
    >
      {/*
        헤더 — 카드(컨테이너) 폭 기준 반응형(figma):
        - 카드 <600:  세로 스택 [제목+(+아이콘) / 바+%]  위 + [검색(전체폭)] 아래
        - 600~1023:   한 줄 [제목 / 바+%] + [검색 + 할 일 추가]  (제목 위 바 아래)
        - ≥1024:      한 줄 [제목 + 바 + %] inline + [검색 + 할 일 추가]
      */}
      <div className="flex flex-col gap-4 px-2 @min-[600px]:flex-row @min-[600px]:items-center @min-[600px]:justify-between">
        <div className="flex min-w-0 flex-col gap-4 @min-[600px]:flex-1 @min-[1024px]:flex-row @min-[1024px]:items-center">
          {/* 제목 행 — 모바일은 우측에 + 아이콘(600px+에선 숨기고 우측 텍스트 버튼 사용) */}
          <div className="flex items-center justify-between gap-2 @min-[1024px]:shrink-0 @min-[1024px]:justify-start">
            <h3 className="min-w-0 truncate text-base font-semibold tracking-[-0.03em] text-slate-700">{goal.title}</h3>
            <IconButton
              aria-label="할 일 추가"
              className="size-9 shrink-0 rounded border border-indigo-500 @min-[600px]:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <IcPlus className="size-4 text-indigo-600" />
            </IconButton>
          </div>
          {/* 진행바 + % */}
          <div className="flex items-center gap-2 @min-[1024px]:flex-1">
            <div
              role="progressbar"
              aria-label={`${goal.title} 진행률`}
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2 w-full max-w-[310px] shrink overflow-hidden rounded-full bg-[#e9e9e9]"
            >
              <motion.div
                className="h-full rounded-full bg-indigo-500"
                initial={reduce ? false : { width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1] }}
              />
            </div>
            <span className="shrink-0 text-sm font-bold tracking-[-0.03em] text-indigo-600 @min-[1024px]:text-base">
              {percent}%
            </span>
          </div>
        </div>
        {/* 검색 + 할 일 추가(텍스트) — 모바일은 검색만 전체폭, 텍스트 버튼은 600px+에서 노출. 둘 다 높이 40px */}
        <div
          className="flex w-full items-center gap-2 @min-[600px]:w-auto @min-[600px]:shrink-0 @min-[1024px]:gap-3.5"
          onClick={(e) => e.stopPropagation()}
        >
          <SearchInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onSearch={() => setKeyword(input)}
            className="h-10 w-full @min-[600px]:w-[240px]"
          />
          <Button
            variant="secondary"
            size="small"
            startIcon={<IcPlus className="size-5 text-indigo-600" />}
            className="hidden h-10 shrink-0 whitespace-nowrap @min-[600px]:inline-flex"
          >
            할 일 추가
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
          <div className="flex flex-col gap-5 @min-[600px]:flex-row @min-[600px]:gap-2 @min-[1024px]:gap-8">
            <Column label="To do" todos={todoItems} onToggle={toggle} onToggleFavorite={toggleFavorite} />
            <Column label="Done" todos={doneItems} onToggle={toggle} onToggleFavorite={toggleFavorite} />
          </div>
        )}
      </div>
    </Card>
  );
}
