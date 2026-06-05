'use client';

import { AnimatePresence, animate, motion, useMotionValue, type PanInfo } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/src/utils/cn';
import GoalSidebarList from '@/src/components/goal/GoalSidebarList';
import { Logo, LogoFull } from '../icons';
import LogoutButton from './LogoutButton';
import SidebarRow from './SidebarRow';
import SidebarProfileButton from './SidebarProfileButton';
import SidebarNotificationButton from './SidebarNotificationButton';
import TodoAddButton from './TodoAddButton';
import TodoFormSheet from '@/src/components/todo/TodoFormSheet';
import { usePathname } from 'next/navigation';

const EXPANDED_WIDTH = 360;
const COLLAPSED_WIDTH = 96;
const TABLET_COLLAPSED_WIDTH = 60;
const TABLET_QUERY = '(max-width: 1280px)';
const SPRING = { type: 'spring', stiffness: 300, damping: 30 } as const;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function Sidebar() {
  const path = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  // 새 할일 생성 폼(시트) 열림 상태 — 사이드바가 소유.
  const [createOpen, setCreateOpen] = useState(false);
  const width = useMotionValue(EXPANDED_WIDTH);
  const dragStartWidth = useRef(EXPANDED_WIDTH);

  const collapsedWidth = isTablet ? TABLET_COLLAPSED_WIDTH : COLLAPSED_WIDTH;
  const snapWidth = (EXPANDED_WIDTH + collapsedWidth) / 2;

  useEffect(() => {
    const mql = window.matchMedia(TABLET_QUERY);
    // 태블릿이면 collapsed, 데스크톱이면 expanded를 기본 상태로 둔다
    const handleChange = () => {
      setIsTablet(mql.matches);
      setCollapsed(mql.matches);
    };
    handleChange();
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  // collapsed/브레이크포인트가 바뀌면 그에 맞는 폭으로 애니메이션한다
  useEffect(() => {
    animate(width, collapsed ? (isTablet ? TABLET_COLLAPSED_WIDTH : COLLAPSED_WIDTH) : EXPANDED_WIDTH, SPRING);
  }, [isTablet, collapsed, width]);

  // 태블릿에서 사이드바가 펼쳐지면(오버레이+백드롭) 배경 스크롤을 잠근다
  useEffect(() => {
    if (!isTablet || collapsed) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isTablet, collapsed]);

  const applyCollapsed = (next: boolean) => {
    setCollapsed(next);
    animate(width, next ? collapsedWidth : EXPANDED_WIDTH, SPRING);
  };

  const handleDragStart = () => {
    dragStartWidth.current = width.get();
  };

  const handleDrag = (_event: unknown, info: PanInfo) => {
    width.set(clamp(dragStartWidth.current + info.offset.x, collapsedWidth, EXPANDED_WIDTH));
  };

  const handleDragEnd = () => {
    applyCollapsed(width.get() < snapWidth);
  };

  return (
    <div className="hidden sm:contents">
      <AnimatePresence>
        {isTablet && !collapsed && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => applyCollapsed(true)}
            className="fixed inset-0 z-40 bg-black/40"
          />
        )}
      </AnimatePresence>
      {isTablet && <span className="w-15" />}
      <motion.aside
        style={{ width }}
        className={cn(
          'scrollbar-slate top-0 left-0 z-50 flex h-screen overflow-x-hidden overflow-y-auto bg-[#1A1B2E]',
          isTablet ? 'fixed' : 'sticky',
        )}
      >
        <div
          className={cn(
            'flex flex-1 flex-col justify-between gap-y-4',
            collapsed ? (isTablet ? 'py-8 pl-2.5' : 'py-8 pr-1 pl-3') : 'pt-8 pr-4 pb-16 pl-8',
          )}
        >
          <div className="flex flex-col gap-y-8">
            <button
              type="button"
              onClick={() => applyCollapsed(!collapsed)}
              aria-label={collapsed ? '사이드바 확장' : '사이드바 축소'}
              className={cn('flex cursor-pointer', collapsed && 'justify-center')}
            >
              {collapsed ? <Logo size={isTablet ? 'sm' : 'md'} /> : <LogoFull type="white" />}
            </button>
            <ul className="flex flex-col gap-y-3">
              <SidebarRow type="dashboard" text="대시보드" href="/" current={path === '/'} collapsed={collapsed} />
              <GoalSidebarList
                collapsed={collapsed}
                onExpand={() => applyCollapsed(false)}
                onSelected={() => {
                  if (isTablet) applyCollapsed(true);
                }}
              />
              <SidebarRow
                type="calendar"
                text="캘린더"
                href="/calendar"
                current={path === '/calendar'}
                collapsed={collapsed}
              />
              <SidebarRow
                type="posts"
                text="소통 게시판"
                href="/posts"
                current={path.startsWith('/posts')}
                collapsed={collapsed}
              />
              <SidebarRow
                type="favorites"
                text="찜한 할일"
                href="/favorites"
                current={path === '/favorites'}
                collapsed={collapsed}
              />
            </ul>
            <ul className="flex flex-col">
              <SidebarRow
                type="settings"
                text="설정"
                href="/settings"
                current={path === '/settings'}
                collapsed={collapsed}
              />
              <LogoutButton collapsed={collapsed} />
            </ul>
          </div>
          {!collapsed && (
            <div className="flex flex-col gap-y-8">
              <TodoAddButton
                onClick={() => {
                  setCreateOpen(true);
                  // 태블릿 오버레이 사이드바는 폼을 가리지 않도록 함께 접는다 (목표 선택과 동일 동작)
                  if (isTablet) applyCollapsed(true);
                }}
              />
              <div className="flex gap-x-2">
                <SidebarProfileButton />
                <SidebarNotificationButton />
              </div>
            </div>
          )}
        </div>
        <motion.span
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          role="separator"
          aria-orientation="vertical"
          className="flex w-4 shrink-0 cursor-ew-resize items-center justify-center transition-colors after:h-15 after:w-1 after:rounded-full after:bg-indigo-800 hover:bg-indigo-600/10"
        />
      </motion.aside>
      <TodoFormSheet mode="create" isOpen={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
