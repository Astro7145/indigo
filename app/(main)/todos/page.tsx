'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

import AsyncBoundary from '@/src/components/common/AsyncBoundary';
import Button from '@/src/components/common/buttons/Button';
import Card from '@/src/components/common/cards/Card';
import { IcPlus } from '@/src/components/common/icons/IcPlus';
import TodoItem from '@/src/components/common/todo-list/TodoItem';
import CategoryTab from '@/src/components/todo/CategoryTab';
import TodoDeleteConfirm from '@/src/components/common/todo-list/TodoDeleteConfirm';
import TodoDetailSheet from '@/src/components/todo/TodoDetailSheet';
import TodoFormSheet from '@/src/components/todo/TodoFormSheet';
import { useAddTodoFavorite, useRemoveTodoFavorite } from '@/src/hooks/favorite';
import { useInfiniteTodoList, useUpdateTodo } from '@/src/hooks/todo';
import type { Todo, TodoListParams } from '@/src/types/todo';

type Tab = 'all' | 'todo' | 'done';
const EMPTY_MSG_BY_TAP = {
  all: '아직 등록한 할 일이 없어요',
  todo: '해야할 일이 아직 없어요',
  done: '완료한 일이 아직 없어요',
};

const DONE_PARAM: Record<Tab, TodoListParams['done']> = {
  all: undefined,
  todo: 'false',
  done: 'true',
};

const listParams = (tab: Tab): Omit<TodoListParams, 'cursor'> => ({ sort: 'latest', limit: 40, done: DONE_PARAM[tab] });

/**
 * /todos — 모든 할 일 페이지
 * ALL/TO DO/DONE 탭으로 `done` 파라미터 매핑, 40개씩 무한 스크롤, 행 등장 애니메이션.
 * 모바일은 GNB가 페이지 타이틀을 담당해 헤더 영역을 숨긴다.
 */
export default function TodosPage() {
  const [tab, setTab] = useState<Tab>('all');

  // 단일 리스트라 시트 상태를 페이지가 직접 소유한다(목표 상세의 GoalDetail과 동일 패턴).
  // 삭제 확인은 deletingTodo가 있을 때만 마운트해 useDeleteTodo/useToast 인스턴스를 단일 유지.
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [creating, setCreating] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null);

  return (
    <section className="mx-auto flex w-full max-w-180 flex-col gap-6">
      {/* 모바일은 GNB가 페이지 타이틀을 담당 → sm+ 에서만 헤더 노출 (Figma 21209:54371) */}
      <div className="hidden items-baseline gap-4 px-2 sm:flex">
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-slate-800">모든 할 일</h1>
        {/* aria-label 미부착 — 스크린리더가 h1 "모든 할 일" + 숫자 텍스트를 그대로 이어 읽도록 둔다 */}
        <AsyncBoundary
          fallback={<span className="text-2xl font-semibold tracking-[-0.03em] text-indigo-600">0</span>}
          errorFallback={<span className="text-2xl font-semibold tracking-[-0.03em] text-indigo-600">0</span>}
          resetKeys={[tab]}
        >
          <TodosCount tab={tab} />
        </AsyncBoundary>
      </div>

      {/* tabs → card 간격은 시안상 12px (header → tabs는 24px = 바깥 section gap-6) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-2">
            <CategoryTab label="ALL" isActive={tab === 'all'} onClick={() => setTab('all')} />
            <CategoryTab label="TO DO" isActive={tab === 'todo'} onClick={() => setTab('todo')} />
            <CategoryTab label="DONE" isActive={tab === 'done'} onClick={() => setTab('done')} />
          </div>
          <Button
            variant="tertiary"
            size="small"
            startIcon={<IcPlus className="size-5 text-slate-500" />}
            onClick={() => setCreating(true)}
          >
            할 일 추가
          </Button>
        </div>

        <Card className="border border-slate-200 p-4 shadow-[0_2px_4px_0_rgba(0,0,0,0.04)] sm:p-8">
          <AsyncBoundary
            fallback={<p className="py-12 text-center text-sm text-slate-400">불러오는 중…</p>}
            errorFallback={<p className="py-12 text-center text-sm text-slate-400">불러오지 못했어요</p>}
            resetKeys={[tab]}
          >
            <TodosList
              tab={tab}
              onEditTodo={setEditingTodo}
              onSelectTodo={setSelectedTodo}
              onDeleteTodo={setDeletingTodo}
            />
          </AsyncBoundary>
        </Card>
      </div>

      {/* 모든 할 일은 폼에서 목표를 선택하므로 생성 시트에 defaultGoalId를 넘기지 않는다. */}
      <TodoFormSheet
        mode="update"
        isOpen={editingTodo !== null}
        onClose={() => setEditingTodo(null)}
        todo={editingTodo}
      />
      <TodoFormSheet mode="create" isOpen={creating} onClose={() => setCreating(false)} />
      <TodoDetailSheet isOpen={selectedTodo !== null} onClose={() => setSelectedTodo(null)} todo={selectedTodo} />
      {deletingTodo && <TodoDeleteConfirm open todo={deletingTodo} onClose={() => setDeletingTodo(null)} />}
    </section>
  );
}

function TodosCount({ tab }: { tab: Tab }) {
  const { data } = useInfiniteTodoList(listParams(tab));
  const totalCount = data.pages[0]?.totalCount ?? 0;
  return <span className="text-2xl font-semibold tracking-[-0.03em] text-indigo-600">{totalCount}</span>;
}

function TodosList({
  tab,
  onEditTodo,
  onSelectTodo,
  onDeleteTodo,
}: {
  tab: Tab;
  onEditTodo: (todo: Todo) => void;
  onSelectTodo: (todo: Todo) => void;
  onDeleteTodo: (todo: Todo) => void;
}) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError } = useInfiniteTodoList(
    listParams(tab),
  );
  const update = useUpdateTodo();
  const addFavorite = useAddTodoFavorite();
  const removeFavorite = useRemoveTodoFavorite();
  const reduce = useReducedMotion();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const todos = data.pages.flatMap((p) => p.todos);

  useEffect(() => {
    const el = sentinelRef.current;
    // 실패 시 sentinel 관찰 중단
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

  if (todos.length === 0) {
    return <p className="py-20 text-center text-sm text-slate-500">{EMPTY_MSG_BY_TAP[tab]}</p>;
  }

  return (
    <>
      <ul className="flex flex-col gap-2">
        {todos.map((t, idx) => {
          // 타입상 noteIds는 number[] required지만, 백엔드 응답이 누락/null인 케이스를 방어한다.
          const hasNote = (t.noteIds?.length ?? 0) > 0;
          return (
            <motion.li
              key={t.id}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              // 페이지가 누적되면 인덱스가 커진다 — 신규 페이지 행만 지연을 받도록 모듈로로 감싼다.
              transition={{ duration: 0.25, ease: 'easeOut', delay: Math.min((idx % 40) * 0.015, 0.3) }}
              className="rounded transition-shadow hover:shadow-[0_2px_8px_0_rgba(0,0,0,0.08)]"
            >
              <TodoItem
                title={t.title}
                checked={t.done}
                onCheckedChange={(done) => toggle(t.id, done)}
                onClick={() => onSelectTodo(t)}
              >
                <TodoItem.Actions>
                  {hasNote && <TodoItem.NoteAction />}
                  {t.linkUrl && <TodoItem.LinkAction />}
                  {!hasNote && <TodoItem.EditAction hoverOnly aria-label="노트 작성" />}
                  <TodoItem.KebabAction hoverOnly onEdit={() => onEditTodo(t)} onDelete={() => onDeleteTodo(t)} />
                  <TodoItem.StarAction active={t.isFavorite} onClick={() => toggleFavorite(t.id, t.isFavorite)} />
                </TodoItem.Actions>
              </TodoItem>
            </motion.li>
          );
        })}
      </ul>
      {hasNextPage && <div ref={sentinelRef} aria-hidden className="h-1 w-full" />}
      {isFetchingNextPage && <p className="py-3 text-center text-sm text-slate-400">불러오는 중…</p>}
    </>
  );
}
