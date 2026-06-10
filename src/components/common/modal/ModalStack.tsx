'use client';

import { useEffect } from 'react';
import { AnimatePresence } from 'motion/react';

import BottomSheet from '@/src/components/common/BottomSheet';
import Modal from '@/src/components/common/modal/Modal';
import { useIsMobile } from '@/src/hooks/useIsMobile';
import { useModalStore, type ModalEntry } from '@/src/stores/modal';
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

  const isBottomSheet = (entry: ModalEntry) =>
    (entry.variant === 'auto' ? (isMobile ? 'bottom-sheet' : 'modal') : entry.variant) === 'bottom-sheet';

  // 엔트리 하나를 알맞은 셸(BottomSheet/Modal)에 내용까지 끼워 렌더한다.
  // zIndex·active(focus trap)는 전체 스택 위치(index) 기준.
  const renderEntry = (entry: ModalEntry, index: number) => {
    const zIndex = 50 + index;
    if (isBottomSheet(entry)) {
      return (
        <BottomSheet
          key={entry.id}
          isOpen
          onClose={close}
          closeOnBackdropClick={entry.closeOnBackdropClick}
          zIndex={zIndex}
          scrollLock={false}
        >
          {entry.render(controls)}
        </BottomSheet>
      );
    }
    return (
      <Modal
        key={entry.id}
        open
        onClose={close}
        closeOnBackdropClick={entry.closeOnBackdropClick}
        closeOnEsc={false}
        active={index === modals.length - 1}
        zIndex={zIndex}
        scrollLock={false}
        className={entry.className}
      >
        {entry.render(controls)}
      </Modal>
    );
  };

  // exit 애니메이션이 있는 BottomSheet만 AnimatePresence로 감싸 slide-down 후 언마운트한다.
  // Modal은 exit 애니메이션이 없어 AnimatePresence 밖에서 즉시 언마운트한다 — 한 AnimatePresence
  // (sync 모드)에 섞으면 closeWithParent로 폼+확인창을 함께 닫을 때 둘의 제거가 묶여, 확인 Modal이
  // BottomSheet의 slide가 끝날 때까지 화면에 남는다. key는 entry.id로 exit 추적을 안정화한다.
  return (
    <>
      <AnimatePresence>{modals.map((entry, i) => isBottomSheet(entry) && renderEntry(entry, i))}</AnimatePresence>
      {modals.map((entry, i) => !isBottomSheet(entry) && renderEntry(entry, i))}
    </>
  );
}
