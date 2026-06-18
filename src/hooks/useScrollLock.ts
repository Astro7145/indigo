'use client';

import { useEffect } from 'react';

import { lockScroll, unlockScroll } from '@/src/utils/scrollLock';

/**
 * enabled인 동안 배경(body) 스크롤을 잠근다. 내부적으로 참조 카운트(scrollLock)를 쓰므로
 * 모달·드로어·오버레이 사이드바가 동시에 호출해도 안전하게 중첩되고, 마지막 해제 시에만 풀린다.
 */
export function useScrollLock(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;
    lockScroll();
    return () => unlockScroll();
  }, [enabled]);
}
