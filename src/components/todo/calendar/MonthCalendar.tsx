'use client';

import { useRef, type ReactNode } from 'react';
import { useButton, useCalendar, useCalendarGrid, useLocale } from 'react-aria';
import { useCalendarState, type CalendarState } from 'react-stately';
import { createCalendar, type CalendarDate } from '@internationalized/date';

import IconButton from '@/src/components/common/buttons/IconButton';
import { IcDoubleArrow } from '@/src/components/common/icons/IcDoubleArrow';
import MonthCalendarCell from '@/src/components/todo/calendar/MonthCalendarCell';
import type { Todo } from '@/src/types/todo';

/** 시안이 월요일 시작 — 요일 라벨도 mon 순서로 고정한다(로케일 비의존). */
const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

export interface MonthCalendarProps {
  /** 선택 날짜 (controlled) */
  value: CalendarDate;
  onChange: (date: CalendarDate) => void;
  /** `CalendarDate.toString()`('YYYY-MM-DD') → 그 날짜의 할일 */
  todosByDate: Map<string, Todo[]>;
  onSelectTodo: (todo: Todo) => void;
  /** 월 네비와 그리드 사이 슬롯 — 목표 필터 드롭다운 */
  children?: ReactNode;
}

/**
 * 월 그리드 캘린더 — react-aria가 키보드 내비·접근성·월 경계 계산을 담당한다.
 * 헤더(« 2025년 1월 » + 필터 슬롯)는 xl에서 한 줄(네비 좌·필터 우), 미만은 세로 스택(네비 중앙).
 * Figma 21209:62586(데스크탑)/21209:62734(태블릿).
 */
export default function MonthCalendar({ value, onChange, todosByDate, onSelectTodo, children }: MonthCalendarProps) {
  const { locale } = useLocale();
  // firstDayOfWeek는 state에 줘야 셀 배치(getDatesInWeek)가 월요일 시작이 된다 — grid 옵션만으로는
  // 요일 라벨·주 수 계산만 바뀌고 날짜가 로케일 기준(ko/en=일요일)으로 깔려 한 칸 어긋난다.
  const state: CalendarState = useCalendarState({ value, onChange, locale, createCalendar, firstDayOfWeek: 'mon' });
  const { calendarProps, prevButtonProps, nextButtonProps } = useCalendar({ value, onChange }, state);
  const { gridProps, headerProps, weeksInMonth } = useCalendarGrid({ firstDayOfWeek: 'mon' }, state);

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const { buttonProps: prevDomProps } = useButton(prevButtonProps, prevRef);
  const { buttonProps: nextDomProps } = useButton(nextButtonProps, nextRef);

  const month = state.visibleRange.start;

  return (
    <div {...calendarProps} className="flex w-full flex-col">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-5 xl:flex-row xl:items-center xl:justify-between xl:px-8">
        <div className="flex items-center justify-center gap-4 xl:justify-start">
          <IconButton {...prevDomProps} ref={prevRef} aria-label="이전 달" className="size-8 rounded-[6px] p-1">
            <IcDoubleArrow state="fold" className="size-6 text-slate-600" />
          </IconButton>
          <h2 className="text-lg leading-7 font-bold text-slate-700">
            {month.year}년 {month.month}월
          </h2>
          <IconButton {...nextDomProps} ref={nextRef} aria-label="다음 달" className="size-8 rounded-[6px] p-1">
            <IcDoubleArrow state="expand" className="size-6 text-slate-600" />
          </IconButton>
        </div>
        {children}
      </div>
      <table {...gridProps} className="w-full table-fixed border-collapse">
        <thead {...headerProps}>
          <tr>
            {WEEKDAY_LABELS.map((day) => (
              <th
                key={day}
                className="border-r border-b border-slate-200 p-2 text-center text-xs leading-4 font-medium text-slate-500 last:border-r-0"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...new Array(weeksInMonth).keys()].map((weekIndex) => (
            <tr key={weekIndex}>
              {state
                .getDatesInWeek(weekIndex)
                .map((date, i) =>
                  date ? (
                    <MonthCalendarCell
                      key={date.toString()}
                      state={state}
                      date={date}
                      todos={todosByDate.get(date.toString()) ?? []}
                      onSelectTodo={onSelectTodo}
                    />
                  ) : (
                    <td key={`empty-${i}`} />
                  ),
                )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
