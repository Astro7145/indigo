'use client';

import { CalendarDate, DateValue, toCalendarDate } from '@internationalized/date';
import { useTranslations } from 'next-intl';
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
  const tCommon = useTranslations('common');

  return (
    <>
      <div className="flex flex-col items-center px-6 py-5">
        <Calendar
          value={pendingDate}
          onChange={(date: DateValue) => onChangePending(toCalendarDate(date))}
          firstDayOfWeek={firstDayOfWeek}
        />
      </div>
      <div className="flex gap-3 px-4 pb-4">
        <Button type="button" variant="tertiary" size="small" className="flex-1" onClick={onCancel}>
          {tCommon('actions.cancel')}
        </Button>
        <Button type="button" variant="primary" size="small" className="flex-1" onClick={onConfirm}>
          {tCommon('actions.confirm')}
        </Button>
      </div>
    </>
  );
}
