'use client';

import { CalendarDate, DateValue, toCalendarDate } from '@internationalized/date';
import { AriaCalendarGridProps } from 'react-aria';
import Calendar from '@/src/components/common/calendar/Calendar';
import Button from '@/src/components/common/buttons/Button';

export interface DatePickerContentProps {
  pendingDate: CalendarDate | null;
  firstDayOfWeek?: AriaCalendarGridProps['firstDayOfWeek'];
  onChangePending: (date: CalendarDate | null) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DatePickerContent({
  pendingDate,
  firstDayOfWeek,
  onChangePending,
  onCancel,
  onConfirm,
}: DatePickerContentProps) {
  return (
    <>
      <div className="px-6 py-5">
        <Calendar
          value={pendingDate}
          onChange={(date: DateValue) => onChangePending(toCalendarDate(date))}
          firstDayOfWeek={firstDayOfWeek}
        />
      </div>
      <div className="flex gap-3 px-4 pb-4">
        <Button variant="tertiary" size="small" className="flex-1" onClick={onCancel}>
          취소
        </Button>
        <Button variant="primary" size="small" className="flex-1" onClick={onConfirm}>
          확인
        </Button>
      </div>
    </>
  );
}
