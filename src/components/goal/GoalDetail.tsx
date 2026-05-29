'use client';

import ProgressCard from '@/src/components/goal/ProgressCard';
import GoalDetailHeader from '@/src/components/goal/GoalDetailHeader';
import GoalNotesCard from '@/src/components/goal/GoalNotesCard';
import GoalTodoColumn from '@/src/components/goal/GoalTodoColumn';
import { useGoal } from '@/src/hooks/goal';
import { useMe } from '@/src/hooks/user';

export interface GoalDetailProps {
  goalId: number;
}

/**
 * 목표 상세 페이지 본문 — 상단 3카드(목표 정보 / 진행도 / 노트 모아보기)와
 * 본문 2컬럼(To do / Done) 보드를 조합한다.
 *
 * - 목표명: `useGoal(goalId)` / 페이지 타이틀의 유저명: `useMe`
 * - 진행도: `ProgressCard`(goalId 변형 — 해당 목표 todos 완료 비율) 재사용
 * - 반응형: 모바일 세로 스택 → 태블릿(sm) 진행도·노트 2열 → 데스크톱(2xl) 전체 가로 배치
 */
export default function GoalDetail({ goalId }: GoalDetailProps) {
  const { data: goal } = useGoal(goalId);
  const { data: me } = useMe();

  return (
    <div className="mx-auto flex w-full max-w-[1312px] flex-col gap-8">
      {/* 모바일(<sm)은 GNB가 타이틀을 담당 → sm+에서 노출. 로드 전후 레이아웃 시프트 방지로 h-8 예약 */}
      <div className="hidden h-8 sm:block">
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-slate-800">{`${me?.name ?? ''}님의 목표`}</h1>
      </div>

      {/* 상단 3카드 */}
      <section className="flex flex-col gap-4 2xl:flex-row 2xl:gap-8">
        <GoalDetailHeader title={goal?.title} className="2xl:w-[640px] 2xl:shrink-0" />
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6 2xl:flex-1">
          <ProgressCard
            goalId={goalId}
            size="xsmall"
            className="w-full shadow-[0_8px_12px_0_rgba(61,54,119,0.25)] transition-shadow hover:shadow-[0_12px_20px_0_rgba(61,54,119,0.35)] sm:flex-1"
          />
          <GoalNotesCard goalId={goalId} className="w-full sm:flex-1" />
        </div>
      </section>

      {/* 본문 2컬럼 — To do / Done */}
      <div className="flex flex-col gap-8 2xl:flex-row 2xl:gap-8">
        <GoalTodoColumn goalId={goalId} done={false} className="2xl:flex-1" />
        <GoalTodoColumn goalId={goalId} done className="2xl:flex-1" />
      </div>
    </div>
  );
}
