'use client';

import { useImperativeHandle, useRef, useState } from 'react';
import { CalendarDate } from '@internationalized/date';
import { AriaCalendarGridProps, FocusScope, useButton, useDialog, useOverlay } from 'react-aria';
import { IcCalendarOutline } from '@/src/components/common/icons';
import BottomSheet from '@/src/components/todo/BottomSheet';
import { cn } from '@/src/utils/cn';
import DatePickerContent from './DatePickerContent';

interface DatePickerProps {
  value: CalendarDate | null;
  onChange?: (date: CalendarDate | null) => void;
  onBlur?: () => void;
  ref?: React.Ref<HTMLButtonElement>;
  firstDayOfWeek?: AriaCalendarGridProps['firstDayOfWeek'];
}

function formatDate(date: CalendarDate | null): string {
  if (!date) return '날짜를 선택해주세요';
  return `${date.year}. ${String(date.month).padStart(2, '0')}. ${String(date.day).padStart(2, '0')}`;
}

export default function DatePicker({ value, onChange, onBlur, ref, firstDayOfWeek = 'sun' }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingDate, setPendingDate] = useState<CalendarDate | null>(value ?? null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => triggerRef.current!);

  const handleToggle = () => {
    if (!isOpen) setPendingDate(value ?? null);
    setIsOpen((prev) => !prev);
  };

  const handleCancel = () => {
    setPendingDate(value ?? null);
    setIsOpen(false);
  };

  const handleConfirm = () => {
    onChange?.(pendingDate);
    setIsOpen(false);
  };

  const { buttonProps } = useButton(
    {
      onPress: handleToggle,
      'aria-haspopup': 'dialog',
      'aria-expanded': isOpen,
      onBlur,
    },
    triggerRef,
  );

  const { overlayProps } = useOverlay(
    {
      isOpen,
      onClose: handleCancel,
      isDismissable: true,
      shouldCloseOnInteractOutside: (el) => !containerRef.current?.contains(el),
    },
    popupRef,
  );

  const { dialogProps } = useDialog({ 'aria-label': '날짜 선택' }, popupRef);
  return (
    <div ref={containerRef} className="relative flex w-full flex-col">
      <button
        ref={triggerRef}
        {...buttonProps}
        className={cn(
          'flex w-full items-center gap-2 rounded bg-white p-4 text-base font-normal tracking-[-0.02em] text-slate-700 transition-colors',
          isOpen ? 'border border-indigo-500' : 'border border-slate-300 hover:border-slate-400',
        )}
      >
        <IcCalendarOutline className="shrink-0" />
        {formatDate(isOpen ? pendingDate : value)}
      </button>

      {/* 모바일 바텀시트 */}
      <div className="md:hidden">
        <BottomSheet isOpen={isOpen} onClose={handleCancel}>
          <div {...dialogProps} aria-label="날짜 선택" className="outline-none">
            <DatePickerContent
              pendingDate={pendingDate}
              firstDayOfWeek={firstDayOfWeek}
              onChangePending={setPendingDate}
              onCancel={handleCancel}
              onConfirm={handleConfirm}
            />
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
            className={cn(
              'absolute top-full left-0 z-50 mt-1 w-[328px] rounded-2xl border border-black/8 bg-white',
              'shadow-[0px_20px_24px_-4px_rgba(10,13,18,0.08),0px_8px_8px_-4px_rgba(10,13,18,0.03),0px_3px_3px_-1.5px_rgba(10,13,18,0.04)]',
              'hidden md:block',
            )}
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
