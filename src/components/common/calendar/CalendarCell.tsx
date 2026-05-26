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
  const ref = useRef<HTMLDivElement>(null);
  const { cellProps, buttonProps, isSelected, isOutsideVisibleRange, isDisabled, formattedDate } = useCalendarCell(
    { date },
    state,
    ref,
  );

  const variant = isOutsideVisibleRange || isDisabled ? 'outside' : isSelected ? 'selected' : 'default';

  const variantClass = {
    outside: 'cursor-default font-normal text-slate-400',
    selected: 'bg-indigo-600 font-medium text-white hover:bg-indigo-700',
    default: 'font-normal text-slate-700 hover:bg-indigo-700 hover:font-medium hover:text-white',
  }[variant];

  return (
    <td {...cellProps} className="p-0">
      <div
        {...buttonProps}
        ref={ref}
        className={cn(
          'relative flex size-10 cursor-pointer items-center justify-center rounded-full outline-none disabled:cursor-not-allowed',
          'text-sm tracking-[-0.42px]',
          variantClass,
        )}
      >
        {formattedDate}
      </div>
    </td>
  );
}
