'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/src/utils/cn';
import { IcChevron, IcFlagFill, IcPlus } from '../icons';

interface SidebarGoal {
  id: number;
  title: string;
}

interface SidebarGoalRowProps {
  goals?: SidebarGoal[];
  current?: boolean;
  collapsed?: boolean;
  onCreateGoal?: (title: string) => void;
  onSelectGoal?: (id: number) => void;
  onExpand?: () => void;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
  isError?: boolean;
  currentGoalId?: number;
}

export default function SidebarGoalRow({
  goals = [],
  current = false,
  collapsed = false,
  onCreateGoal,
  onSelectGoal,
  onExpand,
  hasNextPage = false,
  onLoadMore,
  isLoading = false,
  isError = false,
  currentGoalId,
}: SidebarGoalRowProps) {
  const [open, setOpen] = useState(false);
  const [inputOpen, setInputOpen] = useState(false);
  const [value, setValue] = useState('');

  const listRef = useRef<HTMLUListElement>(null);
  const sentinelRef = useRef<HTMLLIElement>(null);

  // 목록을 펼친 상태에서 sentinel이 보이면 다음 페이지를 요청한다(기존 GoalTodoColumn 패턴).
  useEffect(() => {
    const el = sentinelRef.current;
    const root = listRef.current;
    if (!el || !root || !open || !hasNextPage) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore?.();
      },
      { root, rootMargin: '80px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [open, hasNextPage, onLoadMore, goals.length]);

  if (collapsed) {
    return (
      <li className="list-none">
        <button
          type="button"
          title="목표"
          onClick={() => {
            setOpen(true);
            onExpand?.();
          }}
          className="flex h-14 w-full cursor-pointer items-center justify-center px-0 py-3.5 transition-colors hover:bg-white/5"
        >
          <IcFlagFill state={current ? 'active' : 'default'} />
        </button>
      </li>
    );
  }

  const handleCreate = () => {
    const title = value.trim();
    if (!title) return;
    onCreateGoal?.(title);
    setValue('');
  };

  const handleToggleInput = () => {
    const nextInputOpen = !inputOpen;
    setInputOpen(nextInputOpen);
    if (nextInputOpen && !open) setOpen(true);
  };

  const handleToggleList = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (!nextOpen && inputOpen) setInputOpen(false);
  };

  return (
    <li className="relative list-none">
      {current && <span aria-hidden className="absolute top-3 left-0 h-8 w-1 rounded-xs bg-indigo-500" />}

      <div
        className={cn('flex h-14 items-center justify-between px-4 py-3.5 hover:bg-white/5', current && 'bg-white/10')}
      >
        <button
          type="button"
          onClick={handleToggleList}
          aria-expanded={open}
          className="flex flex-1 cursor-pointer items-center gap-x-2"
        >
          <IcFlagFill state={current ? 'active' : 'default'} />
          <span className="text-lg font-bold text-white">목표</span>
          <IcChevron direction={open ? 'up' : 'down'} className="text-slate-300" />
        </button>

        <button
          type="button"
          onClick={handleToggleInput}
          aria-label="목표 추가"
          aria-expanded={inputOpen}
          className="cursor-pointer rounded-md p-1 transition-colors hover:bg-white/10"
        >
          <IcPlus />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {inputOpen && (
          <motion.div
            key="goal-input"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-x-2.5 border-b-2 border-indigo-500/60 bg-white/8 py-3 pr-4 pl-6">
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                }}
                placeholder="새 목표를 입력하세요"
                aria-label="새 목표 입력"
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white placeholder:text-slate-400 focus:outline-none"
              />
              <span className="shrink-0 text-sm font-semibold text-indigo-400">Enter</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="goal-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <ul ref={listRef} className="scrollbar-slate flex max-h-45 flex-col overflow-y-auto">
              {isLoading ? (
                <li className="list-none px-6 py-2 text-sm text-slate-400">불러오는 중…</li>
              ) : isError ? (
                <li className="list-none px-6 py-2 text-sm text-slate-400">불러오지 못했어요</li>
              ) : goals.length === 0 ? (
                <li className="list-none px-6 py-2 text-sm text-slate-400">목표가 없어요</li>
              ) : (
                <>
                  {goals.map((goal) => (
                    <li key={goal.id} className="w-full list-none">
                      <button
                        type="button"
                        onClick={() => onSelectGoal?.(goal.id)}
                        className="flex w-full cursor-pointer items-center px-6 py-2 hover:bg-white/5"
                      >
                        <span
                          className={cn(
                            'min-w-0 flex-1 truncate text-left text-sm font-semibold text-white',
                            goal.id === currentGoalId && 'text-indigo-300',
                          )}
                        >
                          {goal.title}
                        </span>
                      </button>
                    </li>
                  ))}
                  {hasNextPage && <li ref={sentinelRef} aria-hidden className="h-1 shrink-0 list-none" />}
                </>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
