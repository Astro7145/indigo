'use client';

import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls, usePresence } from 'motion/react';
import { usePreventScroll } from 'react-aria';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  // ModalStack이 스택 구동 시 위임받는 선택적 prop. 기본값은 단독 사용 시 현행과 동일하다.
  zIndex?: number; // 적층 시 z-index를 덮어쓴다 (미지정 시 z-40/z-50 클래스 유지)
  scrollLock?: boolean; // 스택이 scroll lock을 중앙 관리할 땐 false로 끈다
  closeOnBackdropClick?: boolean; // 백드롭 클릭 닫기 (기본 true)
  closeOnEsc?: boolean; // ESC 닫기 (기본 true). ModalStack이 ESC를 중앙 처리할 땐 false로 끈다
}

export default function BottomSheet({
  isOpen,
  onClose,
  children,
  zIndex,
  scrollLock = true,
  closeOnBackdropClick = true,
  closeOnEsc = true,
}: BottomSheetProps) {
  usePreventScroll({ isDisabled: !isOpen || !scrollLock });
  const dragControls = useDragControls();
  const zStyle = zIndex !== undefined ? { zIndex } : undefined;

  // 상위 AnimatePresence(ModalStack)가 이 시트를 스택에서 제거하면 isPresent가 false가 되고,
  // show가 false로 떨어져 내부 AnimatePresence가 slide-down exit를 재생한다. 단독 사용
  // (부모 AnimatePresence 없음)에선 isPresent가 항상 true라 기존처럼 isOpen 토글만으로 동작한다.
  const [isPresent, safeToRemove] = usePresence();
  const show = isOpen && isPresent;

  // 부모가 frozen으로 보존한 subtree에서는 중첩 AnimatePresence의 exit-완료 콜백
  // (onExitComplete/onAnimationComplete)이 부모로 전달되지 않아(motion 12 한계) 언마운트가
  // 멈추고, opacity 0이 된 빈 backdrop이 화면을 덮은 채 남아 다음 상호작용을 가로챈다.
  // exit 길이(아래 transition)만큼 기다린 뒤 safeToRemove로 직접 언마운트를 허가해 이를 막는다.
  useEffect(() => {
    if (isPresent) return;
    const timer = setTimeout(() => safeToRemove?.(), 350);
    return () => clearTimeout(timer);
  }, [isPresent, safeToRemove]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-40 bg-black/30"
          style={zStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => closeOnBackdropClick && onClose()}
        />
      )}
      {show && (
        <motion.div
          key="sheet"
          className="fixed bottom-0 left-0 z-50 flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-[20px] bg-white shadow-[0px_-8px_24px_0px_rgba(0,0,0,0.12)]"
          style={zStyle}
          onKeyDown={(e) => closeOnEsc && e.key === 'Escape' && onClose()}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          drag="y"
          dragListener={false}
          dragControls={dragControls}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 1 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 80 || info.velocity.y > 500) onClose();
          }}
        >
          <div
            onPointerDown={(e) => dragControls.start(e)}
            style={{ touchAction: 'none' }}
            className="flex shrink-0 cursor-grab justify-center pt-[10px] pb-2 active:cursor-grabbing"
          >
            <div className="h-1 w-9 rounded-[2px] bg-slate-300" />
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-8 pt-4 pb-8">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
