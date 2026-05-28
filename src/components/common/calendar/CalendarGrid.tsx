'use client';

import { useCalendarGrid, AriaCalendarGridProps } from 'react-aria';
import { CalendarState, RangeCalendarState } from 'react-stately';
import CalendarCell from './CalendarCell';

interface CalendarGridProps extends AriaCalendarGridProps {
  state: CalendarState | RangeCalendarState;
}

export default function CalendarGrid({ state, ...props }: CalendarGridProps) {
  const { gridProps, headerProps, weekDays, weeksInMonth } = useCalendarGrid(props, state);

  return (
    <table {...gridProps} className="w-full table-fixed border-separate [border-spacing:0_4px]">
      <thead {...headerProps}>
        <tr>
          {weekDays.map((day, index) => (
            <th key={index} className="h-10 text-center text-sm font-medium tracking-[-0.42px] text-slate-700">
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
                date ? <CalendarCell key={date.toString()} state={state} date={date} /> : <td key={`empty-${i}`} />,
              )}
          </tr>
        ))}
        {weeksInMonth < 6 &&
          [...new Array(6 - weeksInMonth).keys()].map((i) => (
            <tr key={`pad-${i}`} aria-hidden="true">
              {[...new Array(7).keys()].map((j) => (
                <td key={j} className="aspect-square" />
              ))}
            </tr>
          ))}
      </tbody>
    </table>
  );
}
