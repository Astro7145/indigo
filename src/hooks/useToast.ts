import { useCallback, useRef } from 'react';

import { useToastStore } from '@/src/stores/toast';

const DEFAULT_DURATION = 3000;

export function useToast(duration = DEFAULT_DURATION) {
  const show = useToastStore((state) => state.show);
  const hide = useToastStore((state) => state.hide);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (message: string) => {
      // 연속 호출 시 이전 타이머를 취소해 dismiss 시점이 중첩되지 않도록 함
      if (timerRef.current) clearTimeout(timerRef.current);
      show(message);
      timerRef.current = setTimeout(hide, duration);
    },
    [show, hide, duration],
  );

  return { showToast, hideToast: hide };
}
