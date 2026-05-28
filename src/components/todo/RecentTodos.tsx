'use client';

import Link from 'next/link';

import TodoList from '@/src/components/common/todo-list/TodoList';
import Card from '@/src/components/common/cards/Card';
import { IcChevron } from '@/src/components/common/icons/IcChevron';
import { IcTask } from '@/src/components/common/icons/IcTask';
import { useAddTodoFavorite, useRemoveTodoFavorite } from '@/src/hooks/favorite';
import { useTodoList, useUpdateTodo } from '@/src/hooks/todo';
import { cn } from '@/src/utils/cn';

export interface RecentTodosProps {
  className?: string;
}

// 폭은 대시보드 상단 그리드 셀을 그대로 채운다(유동) — 데스크톱·태블릿 2열, 모바일 1열은 페이지가 결정.
// @container: 카드 폭 기준으로 높이를 ProgressCard와 동일하게 전환(셀 ≥480px=데스크톱 256, 그 외 187).
const rootClass = '@container flex w-full flex-col gap-2.5';

/**
 * 최근 등록한 할일 카드 — Figma 21673:53974 (Large).
 * `useTodoList`로 최신 할일을 직접 조회하고, 토글/즐겨찾기는 도메인 mutation으로 처리.
 * 각 행은 공통 `TodoList`로 합성 — 상시 표시는 즐겨찾기 별, Note/Link는 hover 시 노출.
 */
export default function RecentTodos({ className }: RecentTodosProps) {
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
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <IcTask aria-hidden className="size-8 shrink-0 @min-[480px]:size-10" />
          <h3 className="text-lg leading-7 font-medium text-black">최근 등록한 할일</h3>
        </div>
        <Link href="/todos" className="flex items-center text-base font-semibold text-indigo-600">
          모두 보기
          <IcChevron direction="right" className="size-5 text-indigo-600" />
        </Link>
      </div>
      <Card className="flex h-[187px] flex-col border border-slate-200 px-4 py-5 shadow-[0_2px_4px_0_rgba(0,0,0,0.04)] @min-[480px]:h-64 @min-[480px]:px-8 @min-[480px]:py-[30px]">
        {isLoading ? (
          <p className="text-sm text-slate-400">불러오는 중…</p>
        ) : isError ? (
          <p className="text-sm text-slate-400">불러오지 못했어요</p>
        ) : todos.length === 0 ? (
          // figma: 빈 상태는 카드 정중앙에 안내 문구
          <p className="m-auto text-center text-sm text-slate-500">최근에 등록한 할 일이 없어요</p>
        ) : (
          <ul className="scrollbar-slate flex flex-1 flex-col gap-1.5 overflow-y-auto">
            {todos.map((t) => {
              // 타입상 noteIds는 number[] required지만, 백엔드 응답이 누락/null인 케이스를 방어한다.
              const hasNote = (t.noteIds?.length ?? 0) > 0;
              return (
                <li key={t.id}>
                  <TodoList title={t.title} checked={t.done} onCheckedChange={(done) => toggle(t.id, done)}>
                    <TodoList.Actions>
                      {/* 시안 순서: 노트(인디케이터) · 링크 · 노트작성(연필, 케밥 왼쪽) · 케밥 · 별 */}
                      {hasNote && <TodoList.NoteAction />}
                      {t.linkUrl && <TodoList.LinkAction />}
                      {/* 노트 없으면 hover 시 노트 작성(연필) 노출 */}
                      {!hasNote && <TodoList.EditAction hoverOnly aria-label="노트 작성" />}
                      <TodoList.KebabAction hoverOnly />
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
