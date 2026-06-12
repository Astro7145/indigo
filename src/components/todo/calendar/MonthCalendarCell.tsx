'use client';

import { useRef } from 'react';
import { useCalendarCell } from 'react-aria';
import { getLocalTimeZone, isToday, type CalendarDate } from '@internationalized/date';
import type { CalendarState } from 'react-stately';

import CalendarTodoChip from '@/src/components/todo/calendar/CalendarTodoChip';
import type { Todo } from '@/src/types/todo';
import { cn } from '@/src/utils/cn';

/** 셀당 표시 한도 — 초과분은 +N (시안 기준 3개) */
const MAX_VISIBLE = 3;

interface MonthCalendarCellProps {
  state: CalendarState;
  date: CalendarDate;
  todos: Todo[];
  onSelectTodo: (todo: Todo) => void;
}

/**
 * 월 그리드 셀 — 날짜 배지(오늘=slate 원, 선택=indigo 원) + 할일 표시.
 * xl: 칩 목록 / 미만: 점 목록(CSS 분기). 이전·다음 달 날짜는 표시 전용(클릭 불가).
 */
export default function MonthCalendarCell({ state, date, todos, onSelectTodo }: MonthCalendarCellProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const { cellProps, buttonProps, isSelected, isOutsideVisibleRange } = useCalendarCell({ date }, state, ref);

  const visible = todos.slice(0, MAX_VISIBLE);
  const overflow = todos.length - MAX_VISIBLE;
  const today = isToday(date, getLocalTimeZone());

  const content = (
    <>
      <span
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
          isSelected && !isOutsideVisibleRange
            ? 'bg-indigo-500 text-white'
            : today
              ? 'bg-slate-100 text-slate-600'
              : 'text-slate-600',
        )}
      >
        {date.day}
      </span>
      {/* xl: 칩 목록 — 콘텐츠 레이어는 pointer-events-none이므로 칩만 클릭을 되살린다 */}
      <span className="pointer-events-auto hidden w-full min-w-0 flex-col gap-1 xl:flex">
        {visible.map((t) => (
          <CalendarTodoChip key={t.id} todo={t} onClick={onSelectTodo} />
        ))}
      </span>
      {/* <xl: 점 목록 */}
      <span className="flex items-center gap-1 px-1 xl:hidden">
        {visible.map((t) => (
          <span
            key={t.id}
            aria-hidden
            className={cn('size-1.5 rounded-full', t.done ? 'bg-slate-400' : 'bg-indigo-500')}
          />
        ))}
      </span>
      {overflow > 0 && <span className="px-1 text-xs font-semibold text-slate-400 xl:px-2">+{overflow}</span>}
    </>
  );

  // 이전·다음 달 날짜: 날짜 선택은 불가(셀 버튼 없음) — 칩은 그대로 클릭 가능
  if (isOutsideVisibleRange) {
    return (
      <td {...cellProps} className="border-r border-b border-slate-200 bg-slate-50 p-0 align-top last:border-r-0">
        <div className="flex h-[100px] flex-col items-start gap-1 p-2 opacity-60 xl:h-[158px]">{content}</div>
      </td>
    );
  }

  // 셀 선택(날짜 클릭)은 절대 위치 오버레이 버튼이 담당하고, 콘텐츠는 pointer-events-none 레이어로 분리한다 —
  // role="button" 안에 칩 <button>이 중첩되는 접근성 위반(대화형 요소 중첩)을 피하면서 셀 전체 클릭 UX를 유지.
  return (
    <td {...cellProps} className="relative border-r border-b border-slate-200 p-0 align-top last:border-r-0">
      <button
        {...buttonProps}
        ref={ref}
        type="button"
        className="absolute inset-0 size-full outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset"
      />
      <div className="pointer-events-none relative z-10 flex h-[100px] flex-col items-start gap-1 p-2 xl:h-[158px]">
        {content}
      </div>
    </td>
  );
}
