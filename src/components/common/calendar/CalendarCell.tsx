'use client';

import { useRef } from 'react';
import { useCalendarCell } from 'react-aria';
import { CalendarDate } from '@internationalized/date';
import { CalendarState, RangeCalendarState } from 'react-stately';
import { cn } from '@/src/utils/cn';

interface CalendarCellProps {
  state: CalendarState | RangeCalendarState;
  date: CalendarDate;
}

export default function CalendarCell({ state, date }: CalendarCellProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const { cellProps, buttonProps, isSelected, isOutsideVisibleRange, isDisabled, formattedDate } = useCalendarCell(
    { date },
    state,
    ref,
  );

  const variant = isOutsideVisibleRange || isDisabled ? 'outside' : isSelected ? 'selected' : 'default';

  const buttonClass = {
    outside: 'cursor-default font-normal text-slate-400',
    selected: 'font-medium text-white',
    default: 'font-normal text-slate-700 group-hover:font-medium group-hover:text-white',
  }[variant];

  const circleClass = {
    outside: '',
    selected: 'bg-indigo-600 group-hover:bg-indigo-700',
    default: 'group-hover:bg-indigo-700',
  }[variant];

  return (
    <td {...cellProps} className="p-0">
      <button
        {...buttonProps}
        ref={ref}
        className={cn(
          'group relative flex h-10 w-full cursor-pointer items-center justify-center outline-none disabled:cursor-not-allowed',
          'text-sm tracking-[-0.42px]',
          buttonClass,
        )}
      >
        <span className={cn('absolute size-10 rounded-full', circleClass)} />
        <span className="relative">{formattedDate}</span>
      </button>
    </td>
  );
}
