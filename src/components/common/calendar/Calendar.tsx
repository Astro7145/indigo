'use client';

import { useRef } from 'react';
import { useCalendar, useLocale, useButton, AriaCalendarProps, AriaCalendarGridProps } from 'react-aria';
import { useCalendarState, DateValue, CalendarState } from 'react-stately';
import { createCalendar } from '@internationalized/date';
import CalendarGrid from './CalendarGrid';
import IconButton from '@/src/components/common/buttons/IconButton';
import { IcChevron } from '@/src/components/common/icons';

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

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const { buttonProps: prevDomProps } = useButton(prevButtonProps, prevRef);
  const { buttonProps: nextDomProps } = useButton(nextButtonProps, nextRef);

  return (
    <div {...calendarProps} className="calendar flex w-full flex-col">
      <div className="flex w-full items-center justify-between px-[calc(100%/16-1rem)]">
        <IconButton
          {...prevDomProps}
          aria-label={prevDomProps['aria-label'] as string}
          className="size-8 overflow-hidden rounded-[6px] p-1.5"
        >
          <IcChevron direction="left" />
        </IconButton>
        <h2 className="text-sm font-semibold tracking-[-0.42px] text-slate-700">{title}</h2>
        <IconButton
          {...nextDomProps}
          aria-label={nextDomProps['aria-label'] as string}
          className="size-8 overflow-hidden rounded-[6px] p-1.5"
        >
          <IcChevron direction="right" />
        </IconButton>
      </div>
      <CalendarGrid state={state} firstDayOfWeek={props.firstDayOfWeek} />
    </div>
  );
}
