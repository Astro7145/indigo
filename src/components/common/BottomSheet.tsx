'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePreventScroll } from 'react-aria';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
  usePreventScroll({ isDisabled: !isOpen });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed bottom-0 left-0 z-50 flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-[20px] bg-white shadow-[0px_-8px_24px_0px_rgba(0,0,0,0.12)]"
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 1 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80 || info.velocity.y > 500) onClose();
            }}
          >
            <div className="flex shrink-0 justify-center pt-[10px]">
              <div className="h-1 w-9 rounded-[2px] bg-slate-300" />
            </div>
            <div className="flex flex-1 flex-col overflow-hidden px-4 pt-6 pb-8 sm:px-8">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
