'use client';

import { useRef } from 'react';
import { useCalendarCell } from 'react-aria';
import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date';
import { CalendarState, RangeCalendarState } from 'react-stately';
import { cn } from '@/src/utils/cn';

interface CalendarCellProps {
  state: CalendarState | RangeCalendarState;
  date: CalendarDate;
}

export default function CalendarCell({ state, date }: CalendarCellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { cellProps, buttonProps, isSelected, isOutsideVisibleRange, isFocused, formattedDate } = useCalendarCell(
    { date },
    state,
    ref,
  );

  const isToday = today(getLocalTimeZone()).compare(date) === 0;

  return (
    <td {...cellProps} className="p-0">
      <div
        {...buttonProps}
        ref={ref}
        hidden={isOutsideVisibleRange}
        className={cn(
          'relative flex size-10 cursor-pointer items-center justify-center rounded-full outline-none',
          'text-sm tracking-[-0.42px]',
          // 배경
          isSelected && isFocused && 'bg-indigo-700',
          isSelected && !isFocused && 'bg-indigo-600',
          !isSelected && (isToday || isFocused) && 'bg-slate-50',
          // 텍스트
          isOutsideVisibleRange
            ? 'text-slate-400 font-normal'
            : isSelected
              ? 'text-white font-medium'
              : isToday || isFocused
                ? 'text-slate-700 font-medium'
                : 'text-slate-700 font-normal',
        )}
      >
        {formattedDate}
      </div>
    </td>
  );
}
