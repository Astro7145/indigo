'use client';

import { animate, useReducedMotion } from 'motion/react';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';

import Card from '@/src/components/common/cards/Card';
import Moonphase from '@/src/components/common/icons/Moonphase';
import StarsDecor from '@/src/components/common/icons/StarsDecor';
import { IcProgress } from '@/src/components/common/icons/IcProgress';
import { useGoal, useGoalList } from '@/src/hooks/goal';
import { useMe } from '@/src/hooks/user';
import { cn } from '@/src/utils/cn';

export type ProgressCardSize = 'default' | 'small' | 'xsmall';

interface ProgressCardViewProps {
  /**
   * 헤더 라벨.
   * - `default` 사이즈: lg+ 외부 헤더 텍스트 (예: "내 진행 상황", "{goalTitle}")
   * - `small`/`xsmall` 사이즈: 카드 내부 상단 라벨 (예: "목표 진행도")
   */
  headerText: string;
  /**
   * 본문 부제. `default` 사이즈에서만 카드 본문에 표시 (예: "{userName}님의 진행도는").
   * `small`/`xsmall` 사이즈에서는 미사용.
   */
  bodyText?: string;
  /** 진행률 0~100 (범위 밖이면 clamp). */
  percent: number;
  size?: ProgressCardSize;
  onClick?: () => void;
  className?: string;
}

// figma Tablet/Mobile/Small 공통 그라데이션 (figma CSS 기준 120°)
const GRADIENT_BODY = 'bg-[linear-gradient(120deg,#6E66C8_0%,#3D3677_73.21%)]';
const GRADIENT_SHADOW = 'shadow-[0_12px_32px_rgba(69,54,143,0.25)]';

// figma small(343×160, 21564:56837 계열) / xsmall(308×160, 21564:56837) — 폭만 차이
const COMPACT_WIDTH: Record<'small' | 'xsmall', string> = {
  small: 'w-[343px]',
  xsmall: 'w-[308px]',
};

/**
 * 0에서 target까지 부드럽게 차오르는 수치를 반환(easeOutCubic — cubic-bezier 근사).
 * 마운트 시 0→target, target이 바뀌면 현재 값에서 새 target으로 재애니메이션.
 * `prefers-reduced-motion`이면 애니메이션 없이 즉시 target.
 * 보간·중단(retarget) 처리는 Motion `animate`에 위임 — 프로젝트 표준 애니메이션 라이브러리.
 */
function useAnimatedNumber(target: number, duration = 700): number {
  const [value, setValue] = useState(0);
  const valueRef = useRef(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      // 즉시 target. 동기 setState는 react-hooks/set-state-in-effect 위반이라 rAF로 한 프레임 지연
      const raf = requestAnimationFrame(() => {
        valueRef.current = target;
        setValue(target);
      });
      return () => cancelAnimationFrame(raf);
    }
    // 현재 값(valueRef)에서 새 target으로 — target 변경 시 cleanup이 이전 애니메이션을 멈춰 재애니메이션
    const controls = animate(valueRef.current, target, {
      duration: duration / 1000,
      // 원본 1-(1-t)³(easeOutCubic)에 대응하는 cubic-bezier
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
 * 진행률 카드 — Figma 21336:51482 (Large), 21551:56705 (Tablet),
 * 21551:56718 (Mobile), Small(343)/Small(308).
 *
 * Figma 컴포넌트 설명: "헤더 텍스트와 퍼센트는 인스턴스에서 오버라이드".
 * 그래서 도메인 객체 대신 text/percent props만 받는다 — 호출 측에서 컴포지션.
 *
 * 그라데이션은 전 사이즈 공통 120° (figma CSS 기준).
 *
 * default:
 *   - lg(≥1024): 외부 헤더(headerText + pie icon) + 그라데이션 본문,
 *     도넛이 카드 내부에 배치, bodyText + percent 표시
 *   - md(768~1023): 헤더 없음, 도넛이 좌측 outside, bodyText + percent 표시
 *   - sm(<768): md와 같은 레이아웃, 도넛 살짝 작게
 * small(343) / xsmall(308):
 *   - dropdown 등 별개 use case. 폭만 다른 160px 높이 그라데이션 카드(120°) +
 *     도넛(165px) + headerText + percent + stars. bodyText 미사용.
 */
function ProgressCardView({
  headerText,
  bodyText,
  percent,
  size = 'default',
  onClick,
  className,
}: ProgressCardViewProps) {
  const safePercent = Math.max(0, Math.min(100, Math.round(percent)));
  // 달 rx와 표시 숫자를 같은 애니메이션 값으로 구동 (0→safePercent, 변경 시 재애니메이션)
  const animatedPercent = useAnimatedNumber(safePercent);
  const displayPercent = Math.round(animatedPercent);

  // wide 레이아웃 bodyText 분리 — "{name}님의 진행도는" 의 마지막 공백 기준.
  // 짧으면 한 줄, 컬럼(174px) 넘으면 자연스럽게 두 줄로 분리, 이름 부분이 단독으로도 길면 ellipsis.
  const lastSpace = bodyText ? bodyText.lastIndexOf(' ') : -1;
  const bodyNamePart = lastSpace > 0 ? bodyText!.slice(0, lastSpace) : (bodyText ?? '');
  const bodyVerbPart = lastSpace > 0 ? bodyText!.slice(lastSpace + 1) : null;

  // onClick 제공 시 root를 키보드 접근 버튼으로 (Card 비-root라 인라인)
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

  if (size === 'small' || size === 'xsmall') {
    // figma Small(343)/Small(308) — 폭만 다른 160px 그라데이션 카드 + 도넛 + 텍스트 + stars.
    return (
      <div
        className={cn(
          'relative h-40 overflow-hidden rounded text-white',
          COMPACT_WIDTH[size],
          GRADIENT_BODY,
          className,
        )}
        {...interactiveProps}
      >
        <Moonphase percent={animatedPercent} className="absolute -top-[2px] -left-[5px] size-[165px]" />
        <div className="absolute top-[49px] left-[169px] flex flex-col gap-0.5">
          <span className="text-sm text-white/85">{headerText}</span>
          <div className="flex items-baseline gap-[3px]">
            <span
              role="progressbar"
              aria-label={headerText}
              aria-valuenow={safePercent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="text-[32px] leading-[39px] font-bold tracking-[-0.03em]"
            >
              {displayPercent}
            </span>
            <span className="text-base leading-[19px] font-bold">%</span>
          </div>
        </div>
        <StarsDecor className="pointer-events-none absolute inset-0 size-full" />
      </div>
    );
  }

  return (
    <div className={cn('flex w-full flex-col gap-2.5', className)} {...interactiveProps}>
      {/* 헤더 — 전 사이즈 노출 (RecentTodos와 동일, figma 데스크톱/태블릿/모바일 모두 표시).
          아이콘 박스는 viewport `2xl:`(=wide 레이아웃 활성 시점)에서 32→40으로 확대. */}
      <div className="flex items-center gap-3 px-2">
        <IcProgress aria-hidden className="size-8 shrink-0 2xl:size-10" />
        <h3 className="text-lg leading-7 font-medium text-black">{headerText}</h3>
      </div>

      {/*
        본문 카드 (그라데이션 120° 전 사이즈 공통). 레이아웃 전환은 viewport 기준 통일:
        - base/sm/lg(<1280): h-[187px], 도넛 overlay (compact) — 1024~1280 셀이 ~275~400으로 좁아 wide 미수용
        - xl(≥1280): h-64, 도넛 inside (flex, wide) — 셀이 충분히 넓어진 뒤 활성
      */}
      <Card
        className={cn(
          'relative h-[187px] overflow-hidden border-0 p-0 text-white',
          GRADIENT_BODY,
          '2xl:h-64',
          GRADIENT_SHADOW,
        )}
      >
        {/* figma overlay — 본체 위에 미세한 하단 어둠 (transparent → rgba(0,0,0,0.07)) */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/[0.07]" />
        {/* compact 도넛 (xl에서 숨김). figma: mobile top=3, tablet(sm) top=-2 */}
        <Moonphase
          percent={animatedPercent}
          className="absolute top-[3px] -left-[11px] size-[182px] sm:-top-[2px] sm:-left-[12px] sm:size-[192px] 2xl:hidden"
        />
        {/* wide 도넛 (xl 이상에서만) */}
        <div className="hidden 2xl:absolute 2xl:top-[18px] 2xl:left-12 2xl:flex 2xl:items-center 2xl:gap-8">
          <Moonphase percent={animatedPercent} className="size-[220px] shrink-0" />
          <div className="flex w-[174px] flex-col gap-3">
            {/* "{name}님의 진행도는" 분리 렌더 — 짧으면 한 줄(name + verb), 길면 verb가 다음 줄로 wrap,
                name이 단독으로도 컬럼 폭 초과 시 …로 truncate. shrink-0 verb가 절대 줄어들지 않게 한다. */}
            <div className="flex flex-wrap gap-x-1.5 text-xl leading-[30px] font-semibold tracking-[-0.03em]">
              <span className="max-w-full min-w-0 truncate">{bodyNamePart}</span>
              {bodyVerbPart && <span className="shrink-0">{bodyVerbPart}</span>}
            </div>
            <div className="flex items-end gap-[5px]">
              <span
                role="progressbar"
                aria-label={headerText}
                aria-valuenow={safePercent}
                aria-valuemin={0}
                aria-valuemax={100}
                className="text-display-xl leading-[74px] font-bold tracking-[-0.03em]"
              >
                {displayPercent}
              </span>
              <span className="text-3xl leading-9 font-medium tracking-[-0.03em]">%</span>
            </div>
          </div>
        </div>

        {/* compact 텍스트 (2xl에서 숨김) */}
        <div className="absolute top-[60px] left-[156px] flex flex-col gap-0.5 sm:left-[164px] 2xl:hidden">
          {/* wide와 동일한 분리 — 좁은 셀에서 "진행도는"이 mid-word로 끊기지 않도록 name/verb 단위로 분리 wrap.
              폰트는 wide와 동일하게 text-xl semibold로 통일 (이전 text-xs는 얇아 보였음). */}
          <div className="flex flex-wrap gap-x-1.5 text-lg leading-[20px] font-semibold tracking-[-0.03em] text-white">
            <span className="max-w-full min-w-0 truncate">{bodyNamePart}</span>
            {bodyVerbPart && <span className="shrink-0">{bodyVerbPart}</span>}
          </div>
          <div className="flex items-baseline gap-0.5">
            <span
              role="progressbar"
              aria-label={headerText}
              aria-valuenow={safePercent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="text-[38px] leading-[46px] font-bold tracking-[-0.03em] sm:text-[40px] sm:leading-[48px]"
            >
              {displayPercent}
            </span>
            <span className="text-[19px] leading-[23px] font-bold sm:text-xl sm:leading-6">%</span>
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
  size?: ProgressCardSize;
  /** 기본 라벨 오버라이드 */
  headerText?: string;
  /** 본문 부제 오버라이드 (전체 변형 기본값: "{name}님의 진행도는") */
  bodyText?: string;
  onClick?: () => void;
  className?: string;
}

function toPercent(done: number, total: number): number {
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

/** 전체 "내 진행 상황" — 모든 goal의 완료/전체 todo를 집계 */
function OverallProgress({ size, headerText, bodyText, onClick, className }: Omit<ProgressCardProps, 'goalId'>) {
  const { data: list } = useGoalList();
  const { data: me } = useMe();
  const goals = list?.goals ?? [];
  const done = goals.reduce((acc, g) => acc + g.completedCount, 0);
  const total = goals.reduce((acc, g) => acc + g.todoCount, 0);
  return (
    <ProgressCardView
      headerText={headerText ?? '내 진행 상황'}
      bodyText={bodyText ?? `${me?.name ?? ''}님의 진행도는`}
      percent={toPercent(done, total)}
      size={size}
      onClick={onClick}
      className={className}
    />
  );
}

/** 단일 "목표 진행도" — 해당 goal의 todos 완료 비율 */
function GoalProgress({
  goalId,
  size,
  headerText,
  bodyText,
  onClick,
  className,
}: ProgressCardProps & { goalId: number }) {
  const { data: goal } = useGoal(goalId);
  const todos = goal?.todos ?? [];
  const done = todos.filter((t) => t.done).length;
  return (
    <ProgressCardView
      headerText={headerText ?? '목표 진행도'}
      bodyText={bodyText}
      percent={toPercent(done, todos.length)}
      size={size}
      onClick={onClick}
      className={className}
    />
  );
}

/**
 * 진행률 카드 — 데이터를 도메인 훅에서 직접 조회.
 * `goalId`가 있으면 해당 목표의 진행도(`useGoal`), 없으면 전체 진행도
 * (`useGoalList` 집계 + `useMe` 이름). 표시·애니메이션은 ProgressCardView가 담당.
 */
export default function ProgressCard({ goalId, ...rest }: ProgressCardProps) {
  return goalId == null ? <OverallProgress {...rest} /> : <GoalProgress goalId={goalId} {...rest} />;
}
