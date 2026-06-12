'use client';

import { motion } from 'motion/react';
import { cn } from '@/src/utils/cn';

interface TodoAddButtonProps {
  onClick?: () => void;
  className?: string;
}

// N 단축키는 Sidebar 본문이 담당 — 버튼은 접히면 언마운트되므로 전역 리스너를 두기에 부적합하다.
export default function TodoAddButton({ onClick, className }: TodoAddButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial="raised"
      animate="raised"
      whileTap="pressed"
      className={cn('relative h-11 w-full cursor-pointer', className)}
    >
      {/* 바닥 — 입체감을 만드는 그림자 층 */}
      <span className="absolute inset-0 rounded-lg bg-indigo-800 shadow-[0_0_0_2px_var(--color-indigo-600)]" />
      {/* 표면 — 평소 4px 떠 있다가(y:0) 누르면 내려가 바닥에 닿는다(y:4) */}
      <motion.span
        variants={{ raised: { y: 0 }, pressed: { y: 4 } }}
        transition={{ ease: 'linear', duration: 0.1 }}
        className="absolute -top-1 right-0 left-0 flex items-center justify-center rounded-lg bg-indigo-700 px-2 py-2"
      >
        <span className="text-lg font-bold tracking-[-0.03em] text-white">새 할일</span>
        <span className="absolute right-2 rounded px-1 py-0.5 text-sm font-semibold text-white opacity-40">
          Press N
        </span>
      </motion.span>
    </motion.button>
  );
}
