'use client';

import TodoList from '@/src/components/common/TodoList/TodoList';
import Card from '@/src/components/common/cards/Card';
import { IcChevron } from '@/src/components/common/icons/IcChevron';
import { IcTask } from '@/src/components/common/icons/IcTask';
import { useAddTodoFavorite, useRemoveTodoFavorite } from '@/src/hooks/favorite';
import { useTodoList, useUpdateTodo } from '@/src/hooks/todo';
import { cn } from '@/src/utils/cn';

export type RecentTodosSize = 'default' | 'small';

export interface RecentTodosProps {
  size?: RecentTodosSize;
  /** "모두 보기" 클릭 핸들러 — 항상 button, 동작은 외부 주입 */
  onSeeAll?: () => void;
  className?: string;
}

const sizeClasses: Record<RecentTodosSize, string> = {
  default: 'w-full md:w-[640px]',
  small: 'w-[344px]',
};

/**
 * 최근 등록한 할일 카드 — Figma 21673:53974 (Large).
 * `useTodoList`로 최신 할일을 직접 조회하고, 토글/즐겨찾기는 도메인 mutation으로 처리.
 * 각 행은 공통 `TodoList`로 합성 — 상시 표시는 즐겨찾기 별, Note/Link는 hover 시 노출.
 */
export default function RecentTodos({ size = 'default', onSeeAll, className }: RecentTodosProps) {
  const { data, isLoading, isError } = useTodoList({ sort: 'latest' });
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
    <div className={cn('flex flex-col gap-2.5', sizeClasses[size], className)}>
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <IcTask aria-hidden className="shrink-0" />
          <h3 className="text-lg leading-7 font-medium text-black">최근 등록한 할일</h3>
        </div>
        <button type="button" onClick={onSeeAll} className="flex items-center text-base font-semibold text-indigo-600">
          모두 보기
          <IcChevron direction="right" className="size-5 text-indigo-600" />
        </button>
      </div>
      <Card size="large" className="border border-slate-200 px-8 py-[30px] shadow-[0_2px_4px_0_rgba(0,0,0,0.04)]">
        {isLoading ? (
          <p className="text-sm text-slate-400">불러오는 중…</p>
        ) : isError ? (
          <p className="text-sm text-slate-400">불러오지 못했어요</p>
        ) : todos.length === 0 ? (
          <p className="text-sm text-slate-500">할일이 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {todos.map((t) => (
              <li key={t.id}>
                <TodoList
                  title={t.title}
                  checked={t.done}
                  onCheckedChange={(done) => toggle(t.id, done)}
                  size={size === 'small' ? 'small' : 'large'}
                >
                  <TodoList.Actions>
                    {t.noteIds.length > 0 && <TodoList.NoteAction />}
                    {t.linkUrl && <TodoList.LinkAction />}
                    <TodoList.KebabAction hoverOnly />
                    <TodoList.StarAction active={t.isFavorite} onClick={() => toggleFavorite(t.id, t.isFavorite)} />
                  </TodoList.Actions>
                </TodoList>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
