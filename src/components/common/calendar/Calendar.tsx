'use client';

import { useCalendar, useLocale, AriaCalendarProps, AriaCalendarGridProps } from 'react-aria';
import { useCalendarState, DateValue, CalendarState } from 'react-stately';
import { createCalendar } from '@internationalized/date';
import CalendarGrid from './CalendarGrid';

interface CalendarProps extends AriaCalendarProps<DateValue> {
  firstDayOfWeek?: AriaCalendarGridProps['firstDayOfWeek'];
}

export default function Calendar(props: CalendarProps) {
  const { locale } = useLocale();
  const state: CalendarState = useCalendarState({
    createCalendar,
    ...props,
    locale,
  });

  const { calendarProps, prevButtonProps, nextButtonProps, title } = useCalendar(props, state);

  return (
    <div {...calendarProps} className="calendar size-100">
      <div className="header">
        <h2>{title}</h2>
        <button {...prevButtonProps}>&lt;</button>
        <button {...nextButtonProps}>&gt;</button>
      </div>
      <CalendarGrid state={state} firstDayOfWeek={props.firstDayOfWeek} />
    </div>
  );
}
