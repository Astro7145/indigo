'use client';

import Card from '@/src/components/common/cards/Card';
import IconButton from '@/src/components/common/buttons/IconButton';
import { IcGoal } from '@/src/components/common/icons/IcGoal';
import { IcKebab } from '@/src/components/common/icons/IcKebab';
import { cn } from '@/src/utils/cn';

export interface GoalDetailHeaderProps {
  /** 목표명. 로딩 중에는 undefined */
  title?: string;
  className?: string;
}

/**
 * 목표 상세 상단의 목표 정보 카드 — 목표 아이콘 + 목표명 + 케밥(더보기) 버튼.
 *
 * 케밥은 수정/삭제 드롭다운 트리거 자리(placeholder)다. 공통 Dropdown(#68)이 추가되면
 * 그때 메뉴(수정하기/삭제하기)를 연결한다 — 현재는 동작 없는 버튼.
 *
 * Figma 21209:54538 (목표 카드, 640×160). 반응형: 높이·패딩·타이포를 viewport 기준으로 조절.
 */
export default function GoalDetailHeader({ title, className }: GoalDetailHeaderProps) {
  return (
    <Card
      className={cn(
        'flex h-16 items-center justify-between gap-2 border border-slate-200 px-4 py-0 shadow-[0_2px_4px_0_rgba(0,0,0,0.04)] transition-shadow hover:shadow-lg sm:h-20 sm:px-6 2xl:h-40 2xl:px-10',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3 2xl:gap-4">
        <IcGoal aria-hidden className="size-8 shrink-0 2xl:size-10" />
        <h2 className="min-w-0 truncate text-xl font-semibold tracking-[-0.03em] text-slate-700 2xl:text-2xl">
          {title}
        </h2>
      </div>
      {/* 더보기(수정/삭제) — 공통 Dropdown(#68) 연동 전 placeholder */}
      <IconButton aria-label="목표 더보기 메뉴" className="shrink-0 rounded-full p-1">
        <IcKebab className="size-6" />
      </IconButton>
    </Card>
  );
}
