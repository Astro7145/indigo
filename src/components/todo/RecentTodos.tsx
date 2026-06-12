'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import Link from 'next/link';

import AsyncBoundary from '@/src/components/common/AsyncBoundary';
import TodoList from '@/src/components/common/todo-list/TodoList';
import TodoDeleteConfirm from '@/src/components/common/todo-list/TodoDeleteConfirm';
import Card from '@/src/components/common/cards/Card';
import { IcChevron } from '@/src/components/common/icons/IcChevron';
import { IcTask } from '@/src/components/common/icons/IcTask';
import { useAddTodoFavorite, useRemoveTodoFavorite } from '@/src/hooks/favorite';
import { useTodoList, useUpdateTodo } from '@/src/hooks/todo';
import type { Todo } from '@/src/types/todo';
import { cn } from '@/src/utils/cn';

export interface RecentTodosProps {
  className?: string;
  onEditTodo: (todo: Todo) => void;
  onSelectTodo: (todo: Todo) => void;
}

// 폭은 대시보드 상단 그리드 셀을 그대로 채운다(유동) — sm+ 2열, 모바일 1열.
// ProgressCard와 동일하게 맞춤: 헤더(아이콘·타이틀)는 viewport `xl`에서 desktop 전환,
// 카드 높이·패딩은 `@container` + cqw로 카드(그리드 칸) 폭에 비례 — 옆 ProgressCard와 높이가 항상 일치.
const rootClass = '@container flex w-full flex-col gap-2.5';
// 로딩·에러·빈 상태 안내 문구 공통 스타일 — 카드 정중앙 배치.
const statusMessageClass = 'text-md m-auto text-center text-slate-500';

/**
 * 최근 등록한 할일 카드 — Figma 21673:53974 (Large).
 * `useTodoList`(suspense)로 최신 할일을 조회한다. suspense 쿼리는 반드시 `AsyncBoundary`로 감싸
 * 로딩/에러를 경계가 처리하게 한다(SSR에선 클라 fetcher의 상대 baseURL이 무효라 children 미렌더).
 */
export default function RecentTodos({ className, onEditTodo, onSelectTodo }: RecentTodosProps) {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');

  return (
    <div className={cn(rootClass, className)}>
      {/* 좁은 폭(2열 셀이 ~260px대로 떨어지는 sm 구간)에서 제목·모두보기가 둘 다 wrap돼 카드가 밀리는 걸 방지:
          좌측 그룹은 min-w-0 + truncate(필요 시 …), 우측 링크는 shrink-0 + whitespace-nowrap로 보존. */}
      <div className="flex items-center justify-between gap-2 px-2">
        <div className="flex min-w-0 items-center gap-3">
          <IcTask aria-hidden className="size-8 shrink-0 xl:size-10" />
          <h3 className="truncate text-base leading-6 font-medium text-black xl:text-lg xl:leading-7">
            {t('recentTodos.title')}
          </h3>
        </div>
        <Link
          href="/todos"
          className="flex shrink-0 items-center text-base font-semibold whitespace-nowrap text-indigo-600"
        >
          {tc('actions.viewAll')}
          <IcChevron direction="right" className="size-5 text-indigo-600" />
        </Link>
      </div>
      <Card className="flex flex-col border border-slate-200 px-4 py-5 shadow-[0_2px_4px_0_rgba(0,0,0,0.04)] sm:h-[187px] xl:h-[max(187px,40cqw)] xl:px-[max(16px,5cqw)] xl:py-[max(20px,4.6875cqw)]">
        <AsyncBoundary
          fallback={<p className={statusMessageClass}>{tc('state.loading')}</p>}
          errorFallback={<p className={statusMessageClass}>{tc('state.loadError')}</p>}
        >
          <RecentTodosContent onEditTodo={onEditTodo} onSelectTodo={onSelectTodo} />
        </AsyncBoundary>
      </Card>
    </div>
  );
}

function RecentTodosContent({ onEditTodo, onSelectTodo }: Pick<RecentTodosProps, 'onEditTodo' | 'onSelectTodo'>) {
  const { data } = useTodoList({ sort: 'latest', limit: 4 });
  const update = useUpdateTodo();
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const addFavorite = useAddTodoFavorite();
  const removeFavorite = useRemoveTodoFavorite();
  // 삭제 확인 모달 대상 — null이면 닫힘.
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null);
  const todos = data.todos;

  const toggle = (todoId: number, done: boolean) => update.mutate({ todoId, body: { done } });
  const toggleFavorite = (todoId: number, isFavorite: boolean) => {
    if (isFavorite) removeFavorite.mutate(todoId);
    else addFavorite.mutate(todoId);
  };

  if (todos.length === 0) {
    // figma: 빈 상태는 카드 정중앙에 안내 문구
    return <p className={statusMessageClass}>{t('recentTodos.empty')}</p>;
  }

  return (
    <>
      <ul className="scrollbar-slate flex flex-1 flex-col gap-1.5 sm:overflow-y-auto">
        {todos.map((todo) => {
          // 타입상 noteIds는 number[] required지만, 백엔드 응답이 누락/null인 케이스를 방어한다.
          const hasNote = (todo.noteIds?.length ?? 0) > 0;
          return (
            <li key={todo.id}>
              <TodoList
                title={todo.title}
                checked={todo.done}
                onCheckedChange={(done) => toggle(todo.id, done)}
                onClick={() => onSelectTodo(todo)}
              >
                <TodoList.Actions>
                  {/* 시안 순서: 노트(인디케이터) · 링크 · 노트작성(연필, 케밥 왼쪽) · 케밥 · 별 */}
                  {hasNote && <TodoList.NoteAction onClick={() => {}} />}
                  {todo.linkUrl && <TodoList.LinkAction onClick={() => {}} />}
                  {/* 노트 없으면 hover 시 노트 작성(연필) 노출 */}
                  {!hasNote && (
                    <TodoList.EditAction onClick={() => {}} hoverOnly aria-label={tc('actions.writeNote')} />
                  )}
                  <TodoList.KebabAction
                    hoverOnly
                    onEdit={() => onEditTodo(todo)}
                    onDelete={() => setDeletingTodo(todo)}
                  />
                  <TodoList.StarAction
                    active={todo.isFavorite}
                    onClick={() => toggleFavorite(todo.id, todo.isFavorite)}
                  />
                </TodoList.Actions>
              </TodoList>
            </li>
          );
        })}
      </ul>
      <TodoDeleteConfirm open={deletingTodo !== null} todo={deletingTodo} onClose={() => setDeletingTodo(null)} />
    </>
  );
}
