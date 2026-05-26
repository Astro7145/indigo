'use client';

import { AnimatePresence, motion } from 'motion/react';

import { useToastStore } from '@/src/stores/toast';

import ToastPortal from '../portals/ToastPortal';
import { IcCheck } from '../icons';

export default function Toast() {
  const { isOpen, message } = useToastStore();

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
            className="fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-x-1 rounded-sm bg-indigo-200 px-4 py-2 shadow-lg"
          >
            <IcCheck color="indigo" className="size-6" />
            {/* 1초전 이라는 문구는 큰 의미가 없어 보여 추가하지 않고 대신 메세지를 자유롭게 입력 가능하도록 구현함 */}
            <span className="text-sm font-semibold text-indigo-600">{message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastPortal>
  );
}
