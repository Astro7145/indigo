'use client';

import { useEffect, useRef, useState } from 'react';

import AsyncBoundary from '@/src/components/common/AsyncBoundary';
import Button from '@/src/components/common/buttons/Button';
import Card from '@/src/components/common/cards/Card';
import { IcPlus } from '@/src/components/common/icons/IcPlus';
import TodoList from '@/src/components/common/todo-list/TodoList';
import CategoryTab from '@/src/components/todo/CategoryTab';
import { useInfiniteTodoList } from '@/src/hooks/todo';
import { useTodoSheet } from '@/src/hooks/useTodoSheet';
import { todosListParams as listParams, type TodosTab } from '@/src/components/todo/todosTab';

type Tab = TodosTab;
const EMPTY_MSG_BY_TAP = {
  all: '아직 등록한 할 일이 없어요',
  todo: '해야할 일이 아직 없어요',
  done: '완료한 일이 아직 없어요',
};

/**
 * /todos 클라 본문 — 탭 상태가 카운트·리스트를 묶으므로 한 덩어리의 클라 섬이다(서버 셸은 page).
 * ALL/TO DO/DONE 탭으로 `done` 파라미터 매핑, 40개씩 무한 스크롤, 행 등장 애니메이션.
 * 모바일은 GNB가 페이지 타이틀을 담당해 헤더 영역을 숨긴다.
 */
export default function TodosView({ initialTab = 'all' }: { initialTab?: TodosTab }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  // 탭을 URL에도 반영(셸로우) — 서버 왕복 없이 새로고침/공유 시 현재 탭이 보존된다.
  const changeTab = (next: Tab) => {
    setTab(next);
    window.history.replaceState(null, '', next === 'all' ? '/todos' : `/todos?tab=${next}`);
  };

  const { openCreate } = useTodoSheet();

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
            <CategoryTab label="ALL" isActive={tab === 'all'} onClick={() => changeTab('all')} />
            <CategoryTab label="TO DO" isActive={tab === 'todo'} onClick={() => changeTab('todo')} />
            <CategoryTab label="DONE" isActive={tab === 'done'} onClick={() => changeTab('done')} />
          </div>
          <Button
            variant="tertiary"
            size="small"
            startIcon={<IcPlus className="size-5 text-slate-500" />}
            onClick={() => openCreate()}
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
            <TodosList tab={tab} />
          </AsyncBoundary>
        </Card>
      </div>
    </section>
  );
}

function TodosCount({ tab }: { tab: Tab }) {
  const { data } = useInfiniteTodoList(listParams(tab));
  const totalCount = data.pages[0]?.totalCount ?? 0;
  return <span className="text-2xl font-semibold tracking-[-0.03em] text-indigo-600">{totalCount}</span>;
}

function TodosList({ tab }: { tab: Tab }) {
  const { openEdit, openDetail } = useTodoSheet();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError } = useInfiniteTodoList(
    listParams(tab),
  );
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

  if (todos.length === 0) {
    return <p className="py-20 text-center text-sm text-slate-500">{EMPTY_MSG_BY_TAP[tab]}</p>;
  }

  return (
    <>
      <TodoList className="flex flex-col gap-2" todos={todos} size="large" onEdit={openEdit} onSelect={openDetail} />
      {hasNextPage && <div ref={sentinelRef} aria-hidden className="h-1 w-full" />}
      {isFetchingNextPage && <p className="py-3 text-center text-sm text-slate-400">불러오는 중…</p>}
    </>
  );
}
