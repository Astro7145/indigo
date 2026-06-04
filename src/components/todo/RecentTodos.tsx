'use client';

import Link from 'next/link';

import TodoList from '@/src/components/common/todo-list/TodoList';
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
}

// 폭은 대시보드 상단 그리드 셀을 그대로 채운다(유동) — sm+ 2열, 모바일 1열.
// ProgressCard와 동일하게 맞춤: 헤더(아이콘·타이틀)는 viewport `xl`에서 desktop 전환,
// 카드 높이·패딩은 `@container` + cqw로 카드(그리드 칸) 폭에 비례 — 옆 ProgressCard와 높이가 항상 일치.
const rootClass = '@container flex w-full flex-col gap-2.5';
// 로딩·에러·빈 상태 안내 문구 공통 스타일 — 카드 정중앙 배치.
const statusMessageClass = 'text-md m-auto text-center text-slate-500';

/**
 * 최근 등록한 할일 카드 — Figma 21673:53974 (Large).
 * `useTodoList`로 최신 할일을 직접 조회하고, 토글/즐겨찾기는 도메인 mutation으로 처리.
 * 각 행은 공통 `TodoList`로 합성 — 상시 표시는 즐겨찾기 별, Note/Link는 hover 시 노출.
 */
export default function RecentTodos({ className, onEditTodo }: RecentTodosProps) {
  const { data, isLoading, isError } = useTodoList({ sort: 'latest', limit: 4 });
  const update = useUpdateTodo();
  const addFavorite = useAddTodoFavorite();
  const removeFavorite = useRemoveTodoFavorite();
  const todos = data?.todos ?? [];

  const toggle = (todoId: number, done: boolean) => update.mutate({ todoId, body: { done } });
  const toggleFavorite = (todoId: number, isFavorite: boolean) => {
    if (isFavorite) removeFavorite.mutate(todoId);
    else addFavorite.mutate(todoId);
  };

  return (
    <div className={cn(rootClass, className)}>
      {/* 좁은 폭(2열 셀이 ~260px대로 떨어지는 sm 구간)에서 제목·모두보기가 둘 다 wrap돼 카드가 밀리는 걸 방지:
          좌측 그룹은 min-w-0 + truncate(필요 시 …), 우측 링크는 shrink-0 + whitespace-nowrap로 보존. */}
      <div className="flex items-center justify-between gap-2 px-2">
        <div className="flex min-w-0 items-center gap-3">
          <IcTask aria-hidden className="size-8 shrink-0 xl:size-10" />
          <h3 className="truncate text-base leading-6 font-medium text-black xl:text-lg xl:leading-7">
            최근 등록한 할일
          </h3>
        </div>
        <Link
          href="/todos"
          className="flex shrink-0 items-center text-base font-semibold whitespace-nowrap text-indigo-600"
        >
          모두 보기
          <IcChevron direction="right" className="size-5 text-indigo-600" />
        </Link>
      </div>
      <Card className="flex flex-col border border-slate-200 px-4 py-5 shadow-[0_2px_4px_0_rgba(0,0,0,0.04)] sm:h-[187px] xl:h-[max(187px,40cqw)] xl:px-[max(16px,5cqw)] xl:py-[max(20px,4.6875cqw)]">
        {isLoading ? (
          <p className={statusMessageClass}>불러오는 중…</p>
        ) : isError ? (
          <p className={statusMessageClass}>불러오지 못했어요</p>
        ) : todos.length === 0 ? (
          // figma: 빈 상태는 카드 정중앙에 안내 문구
          <p className={statusMessageClass}>최근에 등록한 할 일이 없어요</p>
        ) : (
          <ul className="scrollbar-slate flex flex-1 flex-col gap-1.5 sm:overflow-y-auto">
            {todos.map((t) => {
              // 타입상 noteIds는 number[] required지만, 백엔드 응답이 누락/null인 케이스를 방어한다.
              const hasNote = (t.noteIds?.length ?? 0) > 0;
              return (
                <li key={t.id}>
                  <TodoList title={t.title} checked={t.done} onCheckedChange={(done) => toggle(t.id, done)}>
                    <TodoList.Actions>
                      {/* 시안 순서: 노트(인디케이터) · 링크 · 노트작성(연필, 케밥 왼쪽) · 케밥 · 별 */}
                      {hasNote && <TodoList.NoteAction onClick={() => {}} />}
                      {t.linkUrl && <TodoList.LinkAction onClick={() => {}} />}
                      {/* 노트 없으면 hover 시 노트 작성(연필) 노출 */}
                      {!hasNote && <TodoList.EditAction onClick={() => {}} hoverOnly aria-label="노트 작성" />}
                      <TodoList.KebabAction hoverOnly onEdit={() => onEditTodo(t)} />
                      <TodoList.StarAction active={t.isFavorite} onClick={() => toggleFavorite(t.id, t.isFavorite)} />
                    </TodoList.Actions>
                  </TodoList>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
