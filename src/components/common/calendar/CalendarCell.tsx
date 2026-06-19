'use client';

import { useRef } from 'react';
import { useCalendarCell } from 'react-aria';
import { CalendarDate, isToday } from '@internationalized/date';
import { CalendarState, RangeCalendarState } from 'react-stately';
import { cn } from '@/src/utils/cn';

interface CalendarCellProps {
  state: CalendarState | RangeCalendarState;
  date: CalendarDate;
}

// 제품 기준 KST 고정 — SSR(임의 TZ) 렌더와 클라 hydration이 같은 "오늘"을 봐야 한다
const TIMEZONE = 'Asia/Seoul';

export default function CalendarCell({ state, date }: CalendarCellProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const { cellProps, buttonProps, isSelected, isOutsideVisibleRange, isDisabled, formattedDate } = useCalendarCell(
    { date },
    state,
    ref,
  );

  const isTodayDate = isToday(date, TIMEZONE);
  // 캘린더 어딘가에 선택값이 있으면 오늘 강조를 비활성 — 사용자가 고른 날짜에 시선이 가도록
  const hasSelection = state.value != null;
  const variant =
    isOutsideVisibleRange || isDisabled
      ? 'outside'
      : isSelected
        ? 'selected'
        : isTodayDate && !hasSelection
          ? 'today'
          : 'default';

  const { buttonClass, circleClass } = {
    outside: { buttonClass: 'cursor-default font-normal text-slate-400 dark:text-white/40', circleClass: '' },
    selected: { buttonClass: 'font-medium text-white', circleClass: 'bg-indigo-600 group-hover:bg-indigo-700' },
    today: { buttonClass: 'font-medium text-white', circleClass: 'bg-indigo-500 group-hover:bg-indigo-700' },
    default: {
      buttonClass: 'font-normal text-slate-700 hover:font-medium hover:text-white dark:text-white',
      circleClass: 'group-hover:bg-indigo-700',
    },
  }[variant];

  return (
    <td {...cellProps} className="p-0">
      <button
        {...buttonProps}
        ref={ref}
        type="button"
        aria-current={isTodayDate ? 'date' : undefined}
        tabIndex={isOutsideVisibleRange ? -1 : buttonProps.tabIndex}
        className={cn(
          'group relative flex h-10 w-full cursor-pointer items-center justify-center outline-none disabled:cursor-not-allowed',
          'text-sm tracking-[-0.42px]',
          buttonClass,
        )}
      >
        <span
          className={cn(
            'absolute size-10 rounded-full group-focus-visible:ring-2 group-focus-visible:ring-indigo-500 group-focus-visible:ring-inset',
            circleClass,
          )}
        />
        <span className="relative">{formattedDate}</span>
      </button>
    </td>
  );
}
