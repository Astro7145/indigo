'use client';

import { AnimatePresence, motion } from 'motion/react';

import { useToastStore } from '@/src/stores/toast';
import { cn } from '@/src/utils/cn';

import ToastPortal from '../portals/ToastPortal';
import { IcCheck, IcReport } from '../icons';

export default function Toast() {
  const { isOpen, message, variant } = useToastStore();
  const isError = variant === 'error';

  return (
    <ToastPortal>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="toast"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={cn(
              'fixed right-6 bottom-6 flex items-center gap-x-1 rounded-sm px-4 py-2 shadow-lg',
              isError ? 'bg-destructive' : 'bg-indigo-200',
            )}
          >
            {isError ? <IcReport className="size-6 text-white" /> : <IcCheck color="indigo" className="size-6" />}
            {/* 1초전 이라는 문구는 큰 의미가 없어 보여 추가하지 않고 대신 메세지를 자유롭게 입력 가능하도록 구현함 */}
            <span className={cn('text-sm font-semibold', isError ? 'text-white' : 'text-indigo-600')}>{message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastPortal>
  );
}
