'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import AsyncBoundary from '@/src/components/common/AsyncBoundary';
import Card from '@/src/components/common/cards/Card';
import Dropdown from '@/src/components/common/dropdown/Dropdown';
import { IcChevron } from '@/src/components/common/icons/IcChevron';
import { IcGoal } from '@/src/components/common/icons/IcGoal';
import TodoList from '@/src/components/common/todo-list/TodoList';
import CategoryTab from '@/src/components/todo/CategoryTab';
import { useFavoriteTodoList } from '@/src/hooks/favorite';
import { useGoalList } from '@/src/hooks/goal';
import { useTodoSheet } from '@/src/hooks/useTodoSheet';
import { parseFavoritesTab, type FavoritesTab } from '@/src/components/favorite/favoritesTab';
import type { FavoriteTodo } from '@/src/types/favorite';

type Tab = FavoritesTab;

// 클라이언트 필터 (favorites API가 done/goalId 미지원). 카운트·목록이 공유한다.
function filterFavorites(favorites: FavoriteTodo[], tab: Tab, goalId: number | null): FavoriteTodo[] {
  return favorites.filter((f) => {
    if (tab === 'todo' && f.todo.done) return false;
    if (tab === 'done' && !f.todo.done) return false;
    if (goalId !== null && f.todo.goal?.id !== goalId) return false;
    return true;
  });
}

/**
 * /favorites — 찜한 할 일 페이지
 * ALL/TO DO/DONE 탭 + 목표 필터 드롭다운, 행 등장 애니메이션.
 * `/todos`(무한 피드)와 달리 찜은 사용자가 직접 고른 소수 집합이고, favorites API가 `done`/`goalId`
 * 서버 필터를 주지 않는다(응답 `todo`는 전체 Todo·linkUrl 포함). 그래서 무한스크롤 대신 한 번에 전부
 * 불러와(`limit: 100`) 탭·목표 필터를 **클라이언트**에서 처리한다 — 전체가 로드돼 있어 필터·카운트가 정확하다.
 * 모바일은 GNB가 페이지 타이틀을 담당해 헤더 영역을 숨긴다.
 */
export default function FavoritesView() {
  const tCommon = useTranslations('common');
  const tFavorites = useTranslations('favorites');
  // 탭의 단일 소스는 URL — prop 주입은 뒤로가기 시 라우터 캐시의 옛 prop과 현재 URL이 어긋난다.
  const urlTab = parseFavoritesTab(useSearchParams().get('tab') ?? undefined);
  const [tab, setTab] = useState<Tab>(urlTab);
  const [syncedTab, setSyncedTab] = useState<Tab>(urlTab);
  // 뒤로가기/앞으로가기로 URL이 바뀌면 탭을 URL에 맞춘다 (렌더 중 보정)
  if (urlTab !== syncedTab) {
    setSyncedTab(urlTab);
    setTab(urlTab);
  }
  // 탭을 URL에도 반영(셸로우) — 찜 필터링은 클라이언트라 재페칭 없음.
  const changeTab = (next: Tab) => {
    setTab(next);
    window.history.replaceState(null, '', next === 'all' ? '/favorites' : `/favorites?tab=${next}`);
  };
  const [goalId, setGoalId] = useState<number | null>(null);

  // 목표 드롭다운 옵션 (목표는 보통 소수 — 단일 페이지로 충분)
  const { data: goalData } = useGoalList({ limit: 100 });
  const goals = goalData?.goals ?? [];
  const selectedGoal = goals.find((g) => g.id === goalId) ?? null;

  return (
    <section className="mx-auto flex w-full max-w-180 flex-col gap-6">
      {/* 모바일은 GNB가 페이지 타이틀을 담당 → sm+ 에서만 헤더 노출 (Figma 21209:61509) */}
      <div className="hidden items-baseline gap-4 px-2 sm:flex">
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-slate-800">{tFavorites('title')}</h1>
        {/* 카운트는 현재 보이는(필터된) 찜 개수 — 탭·목표 필터에 따라 갱신. aria-label 미부착으로 h1+숫자를 이어 읽힘 */}
        <AsyncBoundary
          fallback={<span className="text-2xl font-semibold tracking-[-0.03em] text-indigo-600">0</span>}
          errorFallback={<span className="text-2xl font-semibold tracking-[-0.03em] text-indigo-600">0</span>}
          resetKeys={[tab, goalId]}
        >
          <FavoritesCount tab={tab} goalId={goalId} />
        </AsyncBoundary>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 px-2">
          <CategoryTab label="ALL" isActive={tab === 'all'} onClick={() => changeTab('all')} />
          <CategoryTab label="TO DO" isActive={tab === 'todo'} onClick={() => changeTab('todo')} />
          <CategoryTab label="DONE" isActive={tab === 'done'} onClick={() => changeTab('done')} />
        </div>

        <Card className="border border-slate-200 p-4 shadow-[0_2px_4px_0_rgba(0,0,0,0.04)] sm:p-8">
          {/* 목표 필터 드롭다운 (Figma 21209:61520) — `/todos`엔 없는 신규 요소 */}
          <Dropdown className="mb-5">
            <Dropdown.Trigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-sm border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <span className="flex items-center gap-3">
                  <IcGoal className="size-8" />
                  <span className="text-base font-semibold tracking-[-0.03em] text-slate-800">
                    {selectedGoal ? selectedGoal.title : tFavorites('goalFilter.all')}
                  </span>
                </span>
                <IcChevron direction="down" />
              </button>
            </Dropdown.Trigger>
            <Dropdown.Menu size="full">
              <Dropdown.Item onClick={() => setGoalId(null)}>{tFavorites('goalFilter.all')}</Dropdown.Item>
              {goals.map((g) => (
                <Dropdown.Item key={g.id} onClick={() => setGoalId(g.id)}>
                  {g.title}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <AsyncBoundary
            fallback={<p className="py-12 text-center text-sm text-slate-400">{tCommon('state.loading')}</p>}
            errorFallback={<p className="py-12 text-center text-sm text-slate-400">{tCommon('state.loadError')}</p>}
            resetKeys={[tab, goalId]}
          >
            <FavoritesList tab={tab} goalId={goalId} />
          </AsyncBoundary>
        </Card>
      </div>
    </section>
  );
}

function FavoritesCount({ tab, goalId }: { tab: Tab; goalId: number | null }) {
  const { data } = useFavoriteTodoList({ limit: 100 });
  const visible = filterFavorites(data.favorites, tab, goalId);
  return <span className="text-2xl font-semibold tracking-[-0.03em] text-indigo-600">{visible.length}</span>;
}

function FavoritesList({ tab, goalId }: { tab: Tab; goalId: number | null }) {
  const tFavorites = useTranslations('favorites');
  const { openEdit, openDetail } = useTodoSheet();
  const { data } = useFavoriteTodoList({ limit: 100 });

  const visible = filterFavorites(data.favorites, tab, goalId);

  if (visible.length === 0) {
    return <p className="py-20 text-center text-sm text-slate-500">{tFavorites('empty')}</p>;
  }

  // 즐겨찾기 응답의 todo는 isFavorite=true인 완전한 Todo — 별 클릭은 TodoList의 일반 토글로 해제가 된다.
  return (
    <TodoList
      className="flex flex-col gap-2"
      todos={visible.map((f) => f.todo)}
      size="large"
      onEdit={openEdit}
      onSelect={openDetail}
    />
  );
}
