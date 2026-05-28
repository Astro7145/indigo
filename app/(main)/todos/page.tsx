'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

import Button from '@/src/components/common/buttons/Button';
import Card from '@/src/components/common/cards/Card';
import { IcPlus } from '@/src/components/common/icons/IcPlus';
import TodoList from '@/src/components/common/todo-list/TodoList';
import CategoryTab from '@/src/components/todo/CategoryTab';
import { useAddTodoFavorite, useRemoveTodoFavorite } from '@/src/hooks/favorite';
import { useInfiniteTodoList, useUpdateTodo } from '@/src/hooks/todo';
import type { TodoListParams } from '@/src/types/todo';

type Tab = 'all' | 'todo' | 'done';

const DONE_PARAM: Record<Tab, TodoListParams['done']> = {
  all: undefined,
  todo: 'false',
  done: 'true',
};

/**
 * /todos — 모든 할 일 페이지. Figma `21209:54289` / `21209:54318` / `21209:54371`.
 * 전체/To Do/Done 탭으로 `done` 파라미터 매핑, 40개씩 무한 스크롤, 행 등장 애니메이션.
 * 모바일은 GNB가 페이지 타이틀을 담당해 헤더 영역을 숨긴다.
 */
export default function TodosPage() {
  const [tab, setTab] = useState<Tab>('all');
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError, isLoading, isError } =
    useInfiniteTodoList({ sort: 'latest', limit: 40, done: DONE_PARAM[tab] });
  const update = useUpdateTodo();
  const addFavorite = useAddTodoFavorite();
  const removeFavorite = useRemoveTodoFavorite();
  const reduce = useReducedMotion();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const todos = data?.pages.flatMap((p) => p.todos) ?? [];
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  useEffect(() => {
    const el = sentinelRef.current;
    // 실패 시 sentinel 관찰 중단 — 화면에 남아 있는 한 무한 재호출되므로 (GoalTodoSection 패턴 동일)
    if (!el || !hasNextPage || isFetchingNextPage || isFetchNextPageError) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextPage();
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  const toggle = (todoId: number, done: boolean) => update.mutate({ todoId, body: { done } });
  const toggleFavorite = (todoId: number, isFavorite: boolean) => {
    if (isFavorite) removeFavorite.mutate(todoId);
    else addFavorite.mutate(todoId);
  };

  return (
    <section className="mx-auto flex w-full max-w-180 flex-col gap-6">
      {/* 모바일은 GNB가 페이지 타이틀을 담당 → sm+ 에서만 헤더 노출 (Figma 21209:54371) */}
      <div className="hidden items-baseline gap-4 px-2 sm:flex">
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-slate-800">모든 할 일</h1>
        <span aria-label="모든 할 일 개수" className="text-2xl font-semibold tracking-[-0.03em] text-indigo-600">
          {totalCount}
        </span>
      </div>

      {/* tabs → card 간격은 시안상 12px (header → tabs는 24px = 바깥 section gap-6) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-2">
            <CategoryTab label="전체" isActive={tab === 'all'} onClick={() => setTab('all')} />
            <CategoryTab label="To Do" isActive={tab === 'todo'} onClick={() => setTab('todo')} />
            <CategoryTab label="Done" isActive={tab === 'done'} onClick={() => setTab('done')} />
          </div>
          {/* 스텁: 모달 작업은 별도 이슈 (기획 SSOT) */}
          <Button variant="tertiary" size="small" startIcon={<IcPlus className="size-5 text-slate-500" />}>
            할 일 추가
          </Button>
        </div>

        <Card className="border border-slate-200 p-4 shadow-[0_2px_4px_0_rgba(0,0,0,0.04)] sm:p-8">
          {isLoading ? (
            <p className="py-12 text-center text-sm text-slate-400">불러오는 중…</p>
          ) : isError ? (
            <p className="py-12 text-center text-sm text-slate-400">불러오지 못했어요</p>
          ) : todos.length === 0 ? (
            <p className="py-20 text-center text-sm text-slate-500">아직 등록한 할 일이 없어요</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {todos.map((t, idx) => (
                <motion.li
                  key={t.id}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  // 페이지가 누적되면 인덱스가 커진다 — 신규 페이지 행만 지연을 받도록 모듈로로 감싼다.
                  transition={{ duration: 0.25, ease: 'easeOut', delay: Math.min((idx % 40) * 0.015, 0.3) }}
                  className="rounded transition-shadow hover:shadow-[0_2px_8px_0_rgba(0,0,0,0.08)]"
                >
                  <TodoList title={t.title} checked={t.done} onCheckedChange={(done) => toggle(t.id, done)}>
                    <TodoList.Actions>
                      {t.noteIds.length > 0 && <TodoList.NoteAction />}
                      {t.linkUrl && <TodoList.LinkAction />}
                      {t.noteIds.length === 0 && <TodoList.EditAction hoverOnly aria-label="노트 작성" />}
                      <TodoList.KebabAction hoverOnly />
                      <TodoList.StarAction active={t.isFavorite} onClick={() => toggleFavorite(t.id, t.isFavorite)} />
                    </TodoList.Actions>
                  </TodoList>
                </motion.li>
              ))}
            </ul>
          )}
          {hasNextPage && <div ref={sentinelRef} aria-hidden className="h-1 w-full" />}
          {isFetchingNextPage && <p className="py-3 text-center text-sm text-slate-400">불러오는 중…</p>}
        </Card>
      </div>
    </section>
  );
}
