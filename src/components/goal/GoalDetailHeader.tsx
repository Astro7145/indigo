'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import Card from '@/src/components/common/cards/Card';
import Dropdown from '@/src/components/common/dropdown/Dropdown';
import IconButton from '@/src/components/common/buttons/IconButton';
import { IcGoal } from '@/src/components/common/icons/IcGoal';
import { IcKebab } from '@/src/components/common/icons/IcKebab';
import GoalDeleteModal from '@/src/components/goal/GoalDeleteModal';
import GoalEditModal from '@/src/components/goal/GoalEditModal';
import { useGoalSuspense } from '@/src/hooks/goal';
import { cn } from '@/src/utils/cn';

export interface GoalDetailHeaderProps {
  goalId: number;
  className?: string;
}

/**
 * 목표 상세 상단의 목표 정보 카드 — 목표 아이콘 + 목표명 + 케밥(더보기) 드롭다운.
 *
 * 케밥 → 수정하기/삭제하기 Dropdown. 수정은 인풋 모달(GoalEditModal), 삭제는 확인 모달
 * (GoalDeleteModal)로 실제 수정/삭제를 수행한다. 삭제 성공 시 대시보드로 이동한다.
 * 모달은 열릴 때만 마운트해 현재 목표명으로 초기화되도록 한다.
 *
 * Figma 21209:54538 (목표 카드, 640×160). 반응형: 높이·패딩·타이포를 viewport 기준으로 조절.
 */
export default function GoalDetailHeader({ goalId, className }: GoalDetailHeaderProps) {
  const tCommon = useTranslations('common');
  const tGoals = useTranslations('goals');
  const router = useRouter();
  const { data: goal } = useGoalSuspense(goalId);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <Card
      className={cn(
        'flex h-16 items-center justify-between gap-2 border border-slate-200 px-4 py-0 shadow-[0_2px_4px_0_rgba(0,0,0,0.04)] transition-shadow hover:shadow-lg sm:h-20 sm:px-6 xl:h-40 xl:px-10',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3 xl:gap-4">
        <IcGoal aria-hidden className="size-8 shrink-0 xl:size-10" />
        <h2 className="min-w-0 truncate text-xl font-semibold tracking-[-0.03em] text-slate-700 xl:text-2xl">
          {goal.title}
        </h2>
      </div>

      <Dropdown className="shrink-0">
        <Dropdown.Trigger asChild>
          <IconButton aria-label={tGoals('moreMenu')} className="rounded-full p-1">
            <IcKebab className="size-6" />
          </IconButton>
        </Dropdown.Trigger>
        <Dropdown.Menu size="small" placement="bottom-end">
          <Dropdown.Item onClick={() => setEditOpen(true)}>{tCommon('actions.edit')}</Dropdown.Item>
          <Dropdown.Item onClick={() => setDeleteOpen(true)} className="text-destructive">
            {tCommon('actions.delete')}
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      {editOpen && <GoalEditModal onClose={() => setEditOpen(false)} goalId={goalId} currentTitle={goal.title} />}
      {deleteOpen && (
        <GoalDeleteModal onClose={() => setDeleteOpen(false)} goalId={goalId} onDeleted={() => router.push('/')} />
      )}
    </Card>
  );
}
