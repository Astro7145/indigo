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
  const { data: goal, isError } = useGoal(goalId);
  const { data: me } = useMe();

  // 목표 조회 실패(삭제된 목표·네트워크 오류 등) 시 빈 화면 대신 안내를 보여준다.
  if (isError) {
    return (
      <div className="mx-auto w-full max-w-[1312px] py-20 text-center text-slate-500">
        목표 정보를 불러오지 못했어요
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1312px] flex-col gap-8">
      {/* 모바일(<sm)은 GNB가 타이틀을 담당 → sm+에서 노출. 로드 전후 레이아웃 시프트 방지로 h-8 예약 */}
      <div className="hidden h-8 sm:block">
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-slate-800">{`${me?.name ?? ''}님의 목표`}</h1>
      </div>

      {/* 상단 3카드 — 2xl에서 목표 카드와 진행도·노트 그룹이 1:1(figma 640:640)로 함께 비례 축소.
          비대칭 flex 분배 이슈를 피하려 grid로 균등 분할. */}
      <section className="grid grid-cols-1 gap-4 2xl:grid-cols-2 2xl:gap-8">
        <GoalDetailHeader goalId={goalId} title={goal?.title} className="min-w-0" />
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          <ProgressCard
            goalId={goalId}
            size="xsmall"
            className="w-full min-w-0 shadow-[0_8px_12px_0_rgba(61,54,119,0.25)] transition-shadow hover:shadow-[0_12px_20px_0_rgba(61,54,119,0.35)]"
          />
          <GoalNotesCard goalId={goalId} className="w-full min-w-0" />
        </div>
      </section>

      {/* 본문 2컬럼 — To do / Done. grid로 균등 분할(2xl) */}
      <div className="grid grid-cols-1 gap-8 2xl:grid-cols-2 2xl:gap-8">
        <GoalTodoColumn goalId={goalId} done={false} />
        <GoalTodoColumn goalId={goalId} done />
      </div>
    </div>
  );
}
