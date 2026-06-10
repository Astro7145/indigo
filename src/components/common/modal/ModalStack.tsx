'use client';

import { useEffect } from 'react';

import BottomSheet from '@/src/components/common/BottomSheet';
import Modal from '@/src/components/common/modal/Modal';
import { useIsMobile } from '@/src/hooks/useIsMobile';
import { useModalStore } from '@/src/stores/modal';
import { lockScroll, unlockScroll } from '@/src/utils/scrollLock';

// 콘텐츠 스택 모달의 단일 오케스트레이터. app/layout.tsx에 한 번만 마운트한다.
// 스택(배열)을 순회 렌더하면서 전역 책임을 독점한다:
// LIFO ESC(document 리스너 1개) · z-index 적층(50+index) · scroll lock(0↔1) ·
// variant 해석(auto→useIsMobile) · focus trap은 최상단만(Modal active).
export default function ModalStack() {
  const modals = useModalStore((s) => s.modals);
  const close = useModalStore((s) => s.close);
  const closeWithParent = useModalStore((s) => s.closeWithParent);
  const isMobile = useIsMobile();

  const hasModals = modals.length > 0;

  // 스택에 하나라도 열려 있으면 body 스크롤을 잠그고, 모두 닫히면 해제한다.
  useEffect(() => {
    if (!hasModals) return;
    lockScroll();
    return () => unlockScroll();
  }, [hasModals]);

  // ESC는 최상단 엔트리에만 작용한다. document 리스너 하나로 LIFO를 보장한다.
  useEffect(() => {
    if (!hasModals) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const top = modals[modals.length - 1];
      if (top.closeOnEsc) close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [modals, hasModals, close]);

  // 모든 닫기는 최상단을 향한다. controls는 위치와 무관하게 동일하다(close=맨 위, closeWithParent=위 2개).
  const controls = { close, closeWithParent };

  return modals.map((entry, index) => {
    const resolved = entry.variant === 'auto' ? (isMobile ? 'bottom-sheet' : 'modal') : entry.variant;
    const isTopmost = index === modals.length - 1;
    const zIndex = 50 + index;

    if (resolved === 'bottom-sheet') {
      return (
        <BottomSheet key={index} isOpen onClose={close} zIndex={zIndex} scrollLock={false}>
          {entry.render(controls)}
        </BottomSheet>
      );
    }

    return (
      <Modal
        key={index}
        open
        onClose={close}
        closeOnBackdropClick={entry.closeOnBackdropClick}
        closeOnEsc={false}
        active={isTopmost}
        zIndex={zIndex}
        scrollLock={false}
        className={entry.className}
      >
        {entry.render(controls)}
      </Modal>
    );
  });
}
