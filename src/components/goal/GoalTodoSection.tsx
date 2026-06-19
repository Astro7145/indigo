'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import AsyncBoundary from '@/src/components/common/AsyncBoundary';
import Dropdown from '@/src/components/common/dropdown/Dropdown';
import GoalTodoBoard from '@/src/components/goal/GoalTodoBoard';
import Card from '@/src/components/common/cards/Card';
import { IcFilter } from '@/src/components/common/icons/IcFilter';
import { IcGoal } from '@/src/components/common/icons/IcGoal';
import { useAllGoalsSuspense } from '@/src/hooks/goal';
import type { GoalSort } from '@/src/types/goal';
import { sortGoals } from '@/src/utils/sortGoals';
import { cn } from '@/src/utils/cn';

export interface GoalTodoSectionProps {
  className?: string;
}

const SORT_OPTIONS: GoalSort[] = ['latest', 'oldest', 'progressHigh', 'progressLow'];
// 초기 노출 카드 수와 센티넬 교차 시 증가 폭 — 보드별 todo 쿼리가 한꺼번에 터지지 않게 점진 렌더한다.
const INITIAL_VISIBLE = 2;
const VISIBLE_STEP = 2;

/**
 * "목표 별 할일" 섹션. 전체 목표를 한 번에 불러와(useAllGoalsSuspense) 선택한 기준으로 클라이언트 정렬하고,
 * 카드는 윈도잉으로 점진 렌더한다(`/goals` API가 정렬을 지원하지 않아 전체 정렬은 클라에서 처리).
 * 목표가 0개면 섹션 헤더와 함께 "등록한 목표가 없어요" 안내를 표시한다(일러스트 없음).
 */
export default function GoalTodoSection({ className }: GoalTodoSectionProps) {
  const tCommon = useTranslations('common');
  const tDashboard = useTranslations('dashboard');
  const [sort, setSort] = useState<GoalSort>('latest');

  return (
    <section aria-label={tDashboard('goalTodos.title')} className={cn('flex flex-col gap-2.5', className)}>
      <div className="flex items-center justify-between gap-2 px-2">
        <div className="flex min-w-0 items-center gap-3">
          <IcGoal aria-hidden className="size-8 shrink-0 xl:size-10" />
          <h2 className="text-base leading-6 font-medium text-black xl:text-lg xl:leading-7 dark:text-white">
            {tDashboard('goalTodos.title')}
          </h2>
        </div>
        {/* 트리거를 고정폭으로 두고 메뉴는 size="full"(=트리거 폭)로 맞춘다 — 'small'(102px)엔
            "진행률 높은순" 라벨이 줄바꿈되고, 메뉴 인라인 width가 className을 덮어 못 늘리기 때문. */}
        <Dropdown className="w-32 shrink-0">
          <Dropdown.Trigger asChild>
            <button
              type="button"
              aria-label={tDashboard('goalTodos.sort.label')}
              className="flex w-32 items-center justify-between gap-1 text-sm whitespace-nowrap text-slate-600 dark:text-white/60"
            >
              {tDashboard(`goalTodos.sort.${sort}`)}
              <IcFilter aria-hidden className="size-5 shrink-0" />
            </button>
          </Dropdown.Trigger>
          <Dropdown.Menu size="full" placement="bottom-start">
            {SORT_OPTIONS.map((opt) => (
              <Dropdown.Item key={opt} selected={opt === sort} onClick={() => setSort(opt)}>
                {tDashboard(`goalTodos.sort.${opt}`)}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <AsyncBoundary
        fallback={
          <p className="py-10 text-center text-sm text-slate-400 dark:text-white/40">{tCommon('state.loading')}</p>
        }
        errorFallback={
          <p className="py-10 text-center text-sm text-slate-400 dark:text-white/40">{tCommon('state.loadError')}</p>
        }
      >
        <GoalTodoSectionContent sort={sort} />
      </AsyncBoundary>
    </section>
  );
}

function GoalTodoSectionContent({ sort }: { sort: GoalSort }) {
  const tDashboard = useTranslations('dashboard');
  const { data } = useAllGoalsSuspense();
  const sorted = sortGoals(data.goals, sort);

  // 정렬을 바꿔도 노출 개수는 유지한다(정렬은 순서만 바꿈) — 윈도우 밖 목표는 스크롤하며 추가 노출.
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const visible = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setVisibleCount((c) => c + VISIBLE_STEP);
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, visibleCount]);

  if (sorted.length === 0) {
    // figma 21209:52456 — 카드 chrome 그대로(일러스트 제외). 텍스트 가운데 정렬용 min-h 확보.
    return (
      <Card className="flex min-h-[200px] items-center justify-center border border-slate-200 shadow-[0_2px_4px_0_rgba(0,0,0,0.04)] dark:border-white/10">
        <p className="text-md m-auto text-center text-slate-500 dark:text-white/60">{tDashboard('goalTodos.empty')}</p>
      </Card>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6 xl:gap-8">
        {visible.map((goal) => (
          <GoalTodoBoard key={goal.id} goal={goal} />
        ))}
      </div>
      {hasMore && <div ref={sentinelRef} aria-hidden className="h-1 w-full" />}
    </>
  );
}
