'use client';

import { CalendarDate } from '@internationalized/date';
import { AriaCalendarGridProps, FocusScope } from 'react-aria';
import { IcCalendarOutline } from '@/src/components/common/icons';
import BottomSheet from '@/src/components/todo/BottomSheet';
import { cn } from '@/src/utils/cn';
import DatePickerContent from './DatePickerContent';
import { useDatePicker } from '../../hooks/useDatePicker';

interface DatePickerProps {
  value: CalendarDate | null;
  onChange?: (date: CalendarDate | null) => void;
  onBlur?: () => void;
  ref?: React.Ref<HTMLButtonElement>;
  firstDayOfWeek?: AriaCalendarGridProps['firstDayOfWeek'];
}

const pickerCardClass =
  'rounded-2xl border border-black/8 bg-white shadow-[0px_20px_24px_-4px_rgba(10,13,18,0.08),0px_8px_8px_-4px_rgba(10,13,18,0.03),0px_3px_3px_-1.5px_rgba(10,13,18,0.04)]';

function formatDate(date: CalendarDate | null): string {
  if (!date) return '날짜를 선택해주세요';
  return `${date.year}. ${String(date.month).padStart(2, '0')}. ${String(date.day).padStart(2, '0')}`;
}

export default function DatePicker(props: DatePickerProps) {
  const {
    isOpen,
    pendingDate,
    setPendingDate,
    firstDayOfWeek,
    containerRef,
    triggerRef,
    popupRef,
    buttonProps,
    overlayProps,
    dialogProps,
    handleCancel,
    handleConfirm,
  } = useDatePicker(props);

  return (
    <div ref={containerRef} className="relative flex w-full flex-col">
      {/* 트리거 */}
      <button
        ref={triggerRef}
        {...buttonProps}
        className={cn(
          'flex w-full items-center gap-2 rounded bg-white p-4 text-base font-normal tracking-[-0.02em] text-slate-700 transition-colors',
          isOpen ? 'border border-indigo-500' : 'border border-slate-300 hover:border-slate-400',
        )}
      >
        <IcCalendarOutline className="shrink-0" />
        {formatDate(isOpen ? pendingDate : props.value)}
      </button>

      {/* 모바일 바텀시트 */}
      <div className="md:hidden">
        <BottomSheet isOpen={isOpen} onClose={handleCancel}>
          <div className="flex justify-center px-[23.5px] pt-4 pb-3">
            <div {...dialogProps} className={cn('w-full max-w-[328px] overflow-hidden outline-none', pickerCardClass)}>
              <DatePickerContent
                pendingDate={pendingDate}
                firstDayOfWeek={firstDayOfWeek}
                onChangePending={setPendingDate}
                onCancel={handleCancel}
                onConfirm={handleConfirm}
              />
            </div>
          </div>
        </BottomSheet>
      </div>

      {/* 데스크탑 팝오버 */}
      {isOpen && (
        <FocusScope restoreFocus autoFocus>
          <div
            ref={popupRef}
            {...overlayProps}
            {...dialogProps}
            className={cn('absolute top-full left-0 z-50 mt-1 hidden w-[328px] md:block', pickerCardClass)}
          >
            <DatePickerContent
              pendingDate={pendingDate}
              firstDayOfWeek={firstDayOfWeek}
              onChangePending={setPendingDate}
              onCancel={handleCancel}
              onConfirm={handleConfirm}
            />
          </div>
        </FocusScope>
      )}
    </div>
  );
}
