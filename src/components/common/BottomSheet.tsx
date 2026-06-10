'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { usePreventScroll } from 'react-aria';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  // ModalStack이 스택 구동 시 위임받는 선택적 prop. 기본값은 단독 사용 시 현행과 동일하다.
  zIndex?: number; // 적층 시 z-index를 덮어쓴다 (미지정 시 z-40/z-50 클래스 유지)
  scrollLock?: boolean; // 스택이 scroll lock을 중앙 관리할 땐 false로 끈다
}

export default function BottomSheet({ isOpen, onClose, children, zIndex, scrollLock = true }: BottomSheetProps) {
  usePreventScroll({ isDisabled: !isOpen || !scrollLock });
  const dragControls = useDragControls();
  const zStyle = zIndex !== undefined ? { zIndex } : undefined;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/30"
            style={zStyle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed bottom-0 left-0 z-50 flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-[20px] bg-white shadow-[0px_-8px_24px_0px_rgba(0,0,0,0.12)]"
            style={zStyle}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
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
        </>
      )}
    </AnimatePresence>
  );
}
