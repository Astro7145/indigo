'use client';

import { AnimatePresence, animate, motion, useMotionValue, type PanInfo } from 'motion/react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/src/utils/cn';
import { Logo, LogoFull } from '../icons';
import SidebarGoalRow from './SidebarGoalRow';
import SidebarRow from './SidebarRow';
import SidebarProfileButton from './SidebarProfileButton';
import SidebarNotificationButton from './SidebarNotificationButton';

const SAMPLE_GOALS = [
  { id: 1, title: '자바스크립트로 웹 서비스 만들기' },
  { id: 2, title: '디자인 시스템 강의 듣기' },
  { id: 3, title: '알고리즘 문제 매일 풀기' },
];

const EXPANDED_WIDTH = 360;
const COLLAPSED_WIDTH = 96;
const TABLET_COLLAPSED_WIDTH = 60;
const TABLET_QUERY = '(max-width: 1023px)';
const SPRING = { type: 'spring', stiffness: 300, damping: 30 } as const;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const width = useMotionValue(EXPANDED_WIDTH);
  const dragStartWidth = useRef(EXPANDED_WIDTH);

  const collapsedWidth = isTablet ? TABLET_COLLAPSED_WIDTH : COLLAPSED_WIDTH;
  const snapWidth = (EXPANDED_WIDTH + collapsedWidth) / 2;

  useEffect(() => {
    const mql = window.matchMedia(TABLET_QUERY);
    const handleChange = () => setIsTablet(mql.matches);
    handleChange();
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  // 브레이크포인트가 바뀌면 축소 폭(96 ↔ 60)을 다시 맞춘다
  useEffect(() => {
    if (collapsed) animate(width, isTablet ? TABLET_COLLAPSED_WIDTH : COLLAPSED_WIDTH, SPRING);
  }, [isTablet, collapsed, width]);

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
    <>
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
        className={cn('flex h-screen overflow-hidden bg-[#1A1B2E]', isTablet && 'fixed top-0 left-0 z-50')}
      >
        <div
          className={cn(
            'flex flex-1 flex-col justify-between',
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
            <div className="flex flex-col gap-y-3">
              <Link href="/" className="group">
                <SidebarRow type="dashboard" text="대쉬보드" collapsed={collapsed} />
              </Link>
              <SidebarGoalRow goals={SAMPLE_GOALS} collapsed={collapsed} onExpand={() => applyCollapsed(false)} />
              <Link href="/calendar" className="group">
                <SidebarRow type="calendar" text="캘린더" collapsed={collapsed} />
              </Link>
              <Link href="/posts" className="group">
                <SidebarRow type="posts" text="소통 게시판" collapsed={collapsed} />
              </Link>
              <Link href="/favorites" className="group">
                <SidebarRow type="favorites" text="찜한 할일" collapsed={collapsed} />
              </Link>
            </div>
            <div className="flex flex-col">
              <SidebarRow type="settings" text="설정" collapsed={collapsed} />
              <SidebarRow type="logout" text="로그아웃" collapsed={collapsed} />
            </div>
          </div>
          {!collapsed && (
            <div className="flex flex-col gap-y-8">
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
    </>
  );
}
