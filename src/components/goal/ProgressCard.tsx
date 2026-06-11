'use client';

import { animate, useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';

import Card from '@/src/components/common/cards/Card';
import Moonphase from '@/src/components/common/icons/Moonphase';
import StarsDecor from '@/src/components/common/icons/StarsDecor';
import { IcProgress } from '@/src/components/common/icons/IcProgress';
import { useGoal, useGoalList } from '@/src/hooks/goal';
import { useMe } from '@/src/hooks/user';
import { cn } from '@/src/utils/cn';

interface ProgressCardViewProps {
  /** 헤더 라벨 (카드 위 헤더). */
  headerText?: string;
  /** 본문 부제(예: "{userName}님의 진행도는"). */
  bodyText?: string;
  /** 진행률 0~100 (범위 밖이면 clamp). */
  percent: number;
  /** 카드 본문 높이(px, 187 또는 160). xl에서는 max(이 값, 40cqw)로 확장. 기본 187. */
  cardHeight?: 187 | 160;
  onClick?: () => void;
  className?: string;
}

// 카드 배경 그라데이션(120°)·그림자 — 전 사이즈 공통
const GRADIENT_BODY = 'bg-[linear-gradient(120deg,#6E66C8_0%,#3D3677_73.21%)]';
const GRADIENT_SHADOW = 'shadow-[0_12px_32px_rgba(69,54,143,0.25)]';

// 카드 높이를 CSS 변수(--card-h)로 주입 — 동적 px는 Tailwind JIT가 못 잡아 허용 값만 리터럴 클래스로 매핑.
// 카드·달이 var(--card-h)를 참조한다(h-[var(--card-h)], size-[min(...,var(--card-h))]).
const CARD_H_CLASS: Record<NonNullable<ProgressCardViewProps['cardHeight']>, string> = {
  187: '[--card-h:187px]',
  160: '[--card-h:160px]',
};

/**
 * 0 → target으로 부드럽게 차오르는 숫자. target이 바뀌면 현재 값에서 다시 애니메이션.
 * prefers-reduced-motion이면 즉시 target. 보간은 Motion animate에 맡긴다.
 */
function useAnimatedNumber(target: number, duration = 700): number {
  const [value, setValue] = useState(0);
  const valueRef = useRef(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      // rAF로 한 프레임 미룸 — effect 안에서 바로 setState 하면 lint 위반
      const raf = requestAnimationFrame(() => {
        valueRef.current = target;
        setValue(target);
      });
      return () => cancelAnimationFrame(raf);
    }
    // 현재 값에서 새 target으로 (cleanup이 이전 애니메이션 정리)
    const controls = animate(valueRef.current, target, {
      duration: duration / 1000,
      // easeOutCubic
      ease: [0.215, 0.61, 0.355, 1],
      onUpdate: (latest) => {
        valueRef.current = latest;
        setValue(latest);
      },
    });
    return () => controls.stop();
  }, [target, duration, reduce]);

  return value;
}

/**
 * 진행률 카드 (표시 전용) — text/percent props만 받아 호출 측에서 조합한다.
 * 헤더 + 본문 카드. 본문은 viewport로 형태가 바뀜 —
 * <xl(모바일·태블릿)=작은 형태, ≥xl(데스크탑)=큰 형태(달·숫자 확대).
 */
function ProgressCardView({
  headerText,
  bodyText,
  percent,
  cardHeight = 187,
  onClick,
  className,
}: ProgressCardViewProps) {
  const safePercent = Math.max(0, Math.min(100, Math.round(percent)));
  // 달 모양과 숫자를 같은 애니메이션 값으로 그린다
  const animatedPercent = useAnimatedNumber(safePercent);
  const displayPercent = Math.round(animatedPercent);

  // "{name}님의 진행도는"을 마지막 공백에서 이름/뒷말로 나눈다 (이름만 truncate하려고).
  const lastSpace = bodyText ? bodyText.lastIndexOf(' ') : -1;
  const bodyNamePart = lastSpace > 0 ? bodyText!.slice(0, lastSpace) : (bodyText ?? '');
  const bodyVerbPart = lastSpace > 0 ? bodyText!.slice(lastSpace + 1) : null;

  // onClick 있으면 키보드로도 누를 수 있는 버튼으로
  const interactiveProps = onClick
    ? {
        role: 'button' as const,
        tabIndex: 0,
        onClick,
        onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        },
      }
    : {};

  return (
    // @container: 본문 wide가 카드(그리드 칸) 폭에 cqw로 반응하도록 컨테이너 지정
    <div
      className={cn('@container flex w-full flex-col gap-2.5', CARD_H_CLASS[cardHeight], className)}
      {...interactiveProps}
    >
      {/* 헤더 (전 사이즈 공통). 데스크탑(xl)에서 아이콘·글씨 한 단계 커짐 */}
      {headerText && (
        <div className="flex items-center gap-3 px-2">
          <IcProgress aria-hidden className="size-8 shrink-0 xl:size-10" />
          <h3 className="text-base leading-6 font-medium text-black xl:text-lg xl:leading-7">{headerText}</h3>
        </div>
      )}

      {/* 본문 카드. 한 flex 블록이 viewport로 바뀐다:
          - <xl(모바일·태블릿): 작은 카드, 달이 좌측 모서리에 걸침, 텍스트 위 정렬 (달은 sm에서 살짝 커짐)
          - ≥xl(데스크탑): 안쪽 배치 + 수직 중앙. 달·숫자·여백·높이를 카드 폭에 비례(cqw)시켜
            좁은 칸에선 작게, 넓어질수록 풀사이즈(카드 640px에서 달 220·숫자 80px). */}
      <Card
        className={cn(
          'relative h-[var(--card-h)] overflow-hidden border-0 p-0 text-white',
          GRADIENT_BODY,
          GRADIENT_SHADOW,
          'xl:h-[max(var(--card-h),40cqw)]',
        )}
      >
        {/* 아래로 갈수록 살짝 어두워지는 오버레이 */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/[0.07]" />

        {/* relative: overlay 위·stars 아래로 쌓이게. 데스크탑은 달을 좌측에서 pl(12cqw)만큼 띄워
            좌측-중앙에 두고(텍스트가 우측을 채움) — 달 위치가 이름 길이와 무관하게 카드 폭에만 반응 */}
        <div className="relative flex h-full items-center pl-1 xl:pr-[7.5cqw] xl:pl-[10cqw]">
          {/* 달: 평소 182px이되 카드가 좁아지면 폭(55cqw)·높이(var(--card-h))에 맞춰 축소. xl은 폭 비례 연속 스케일 */}
          <Moonphase
            percent={animatedPercent}
            className="mt-0 mr-0 ml-0 size-[min(182px,55cqw,var(--card-h))] shrink-0 xl:size-[34.375cqw]"
          />
          {/* 텍스트: 남은 폭을 채우고 좁으면 truncate (달 위치는 텍스트와 무관) */}
          <div className="mr-3 flex min-w-0 flex-1 flex-col gap-0.5 xl:mr-0 xl:gap-[1.875cqw]">
            {/* 이름 + 뒷말. 좁으면 뒷말은 줄바꿈, 이름은 truncate */}
            <div className="flex flex-wrap gap-x-1.5 text-lg leading-[20px] font-semibold tracking-[-0.03em] xl:text-[max(18px,3.125cqw)] xl:leading-[1.5]">
              <span className="max-w-full min-w-0 truncate">{bodyNamePart}</span>
              {bodyVerbPart && <span className="shrink-0">{bodyVerbPart}</span>}
            </div>
            <div className="flex items-baseline gap-0.5 xl:items-end xl:gap-[5px]">
              <span
                role="progressbar"
                aria-label={headerText}
                aria-valuenow={safePercent}
                aria-valuemin={0}
                aria-valuemax={100}
                className="text-[38px] leading-[46px] font-bold tracking-[-0.03em] xl:text-[12.5cqw] xl:leading-[0.925]"
              >
                {displayPercent}
              </span>
              <span className="text-[19px] leading-[23px] font-bold xl:text-[max(20px,4.6875cqw)] xl:leading-[1.2] xl:font-medium xl:tracking-[-0.03em]">
                %
              </span>
            </div>
          </div>
        </div>

        <StarsDecor className="pointer-events-none absolute inset-0 size-full" />
      </Card>
    </div>
  );
}

export interface ProgressCardProps {
  /** 있으면 해당 goal "목표 진행도", 없으면 전체 "내 진행 상황" */
  goalId?: number;
  /** 기본 라벨 */
  headerText?: string;
  /** 본문 */
  bodyText?: string;
  onClick?: () => void;
  className?: string;
}

function toPercent(done: number, total: number): number {
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

/** 전체 "내 진행 상황" — 모든 goal의 완료/전체 todo를 집계 */
function OverallProgress({ headerText, bodyText, onClick, className }: Omit<ProgressCardProps, 'goalId'>) {
  const t = useTranslations('dashboard');
  const { data: list } = useGoalList();
  const { data: me } = useMe();
  const goals = list?.goals ?? [];
  const done = goals.reduce((acc, g) => acc + g.completedCount, 0);
  const total = goals.reduce((acc, g) => acc + g.todoCount, 0);
  return (
    <ProgressCardView
      headerText={headerText ?? t('progress.header')}
      bodyText={bodyText ?? t('progress.body', { name: me?.name ?? '' })}
      percent={toPercent(done, total)}
      cardHeight={187}
      onClick={onClick}
      className={className}
    />
  );
}

/** 단일 "목표 진행도" — 해당 goal의 todos 완료 비율 */
function GoalProgress({ goalId, bodyText, onClick, className }: ProgressCardProps & { goalId: number }) {
  const t = useTranslations('goals');
  const { data: goal } = useGoal(goalId);
  const todos = goal?.todos ?? [];
  const done = todos.filter((todo) => todo.done).length;
  return (
    <ProgressCardView
      bodyText={bodyText ?? t('progress')}
      percent={toPercent(done, todos.length)}
      cardHeight={160}
      onClick={onClick}
      className={className}
    />
  );
}

/**
 * 진행률 카드. goalId 있으면 해당 목표, 없으면 전체 진행도.
 * 데이터는 훅에서 조회하고 표시는 ProgressCardView가 맡는다.
 */
export default function ProgressCard({ goalId, ...rest }: ProgressCardProps) {
  return goalId == null ? <OverallProgress {...rest} /> : <GoalProgress goalId={goalId} {...rest} />;
}
