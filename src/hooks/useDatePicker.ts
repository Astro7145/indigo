'use client';

import { useImperativeHandle, useRef, useState } from 'react';
import { CalendarDate } from '@internationalized/date';
import { AriaCalendarGridProps, useButton, useDialog, useOverlay } from 'react-aria';

interface UseDatePickerProps {
  value: CalendarDate | null;
  onChange?: (date: CalendarDate | null) => void;
  onBlur?: () => void;
  ref?: React.Ref<HTMLButtonElement>;
  firstDayOfWeek?: AriaCalendarGridProps['firstDayOfWeek'];
}

export function useDatePicker({ value, onChange, onBlur, ref, firstDayOfWeek = 'sun' }: UseDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingDate, setPendingDate] = useState<CalendarDate | null>(value ?? null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref ?? null, () => triggerRef.current!);

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

  return {
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
  };
}
