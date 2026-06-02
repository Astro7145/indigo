'use client';

import { animate, motion, useMotionValue, useTransform, type PanInfo } from 'motion/react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePageTitle } from '@/src/hooks/usePageTitle';
import { IcBell, LogoFull } from '../icons';
import SidebarGoalRow from './SidebarGoalRow';
import SidebarNotificationButton from './SidebarNotificationButton';
import SidebarProfileButton from './SidebarProfileButton';
import SidebarRow from './SidebarRow';

const COLLAPSED_HEIGHT = 56; // pt-4(16) + h-6(24) + 핸들 h-4(16)
const SPRING = { type: 'spring', stiffness: 300, damping: 30 } as const;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function Topbar() {
  const title = usePageTitle();
  const [expandedHeight, setExpandedHeight] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const height = useMotionValue(COLLAPSED_HEIGHT);
  const dragStartHeight = useRef(COLLAPSED_HEIGHT);

  // 드래그로 높이가 늘어남에 따라 접힘(인사말)→펼침(메뉴) 레이아웃을 교차 페이드
  const barOpacity = useTransform(height, [COLLAPSED_HEIGHT, COLLAPSED_HEIGHT + 80], [1, 0]);
  const menuOpacity = useTransform(height, [COLLAPSED_HEIGHT + 60, COLLAPSED_HEIGHT + 200], [0, 1]);

  // 펼친 높이 = 뷰포트 높이 (전체 화면 메뉴)
  useEffect(() => {
    const update = () => {
      const next = window.innerHeight;
      setExpandedHeight(next);
      if (height.get() > COLLAPSED_HEIGHT) height.set(next);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [height]);

  const expand = () => {
    setExpanded(true);
    animate(height, expandedHeight, SPRING);
  };

  const collapse = () => {
    setExpanded(false);
    animate(height, COLLAPSED_HEIGHT, SPRING);
  };

  const handleDragStart = () => {
    dragStartHeight.current = height.get();
  };

  const handleDrag = (_event: unknown, info: PanInfo) => {
    if (!expandedHeight) return;
    height.set(clamp(dragStartHeight.current + info.offset.y, COLLAPSED_HEIGHT, expandedHeight));
  };

  const handleDragEnd = () => {
    if (!expandedHeight) return;
    if (height.get() > (COLLAPSED_HEIGHT + expandedHeight) / 2) expand();
    else collapse();
  };

  return (
    <>
      {/* 접힌 높이만큼 자리를 차지해 본문이 바 아래에서 시작하도록 한다 */}
      <div aria-hidden className="h-14 shrink-0 md:hidden" />

      <motion.div
        style={{ height }}
        className="fixed inset-x-0 top-0 z-50 flex flex-col overflow-hidden bg-[#1A1B2E] sm:hidden"
      >
        {/* 접힘 상태: 인사말 + 알림 */}
        <motion.div
          style={{ opacity: barOpacity }}
          aria-hidden={expanded}
          className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-4"
        >
          <span className="text-base font-semibold text-slate-50">{title}</span>
          <IcBell state="read" className="size-5 text-slate-50" />
        </motion.div>

        {/* 펼침 상태: 사이드바와 동일한 메뉴 */}
        <motion.div
          style={{ opacity: menuOpacity }}
          aria-hidden={!expanded}
          className={`flex h-full min-h-0 flex-col justify-between overflow-y-hidden px-5 pt-4 pb-12 ${
            expanded ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          <div className="flex flex-col gap-y-8">
            <button type="button" onClick={collapse} aria-label="메뉴 접기" className="flex w-fit cursor-pointer">
              <LogoFull type="white" />
            </button>
            <ul className="flex flex-col gap-y-3">
              <Link href="/" className="group" onClick={collapse}>
                <SidebarRow type="dashboard" text="대쉬보드" />
              </Link>
              <SidebarGoalRow />
              <Link href="/calendar" className="group" onClick={collapse}>
                <SidebarRow type="calendar" text="캘린더" />
              </Link>
              <Link href="/posts" className="group" onClick={collapse}>
                <SidebarRow type="posts" text="소통 게시판" />
              </Link>
              <Link href="/favorites" className="group" onClick={collapse}>
                <SidebarRow type="favorites" text="찜한 할일" />
              </Link>
            </ul>
            <div className="flex flex-col">
              <SidebarRow type="settings" text="설정" />
              <SidebarRow type="logout" text="로그아웃" />
            </div>
          </div>

          <div className="flex gap-x-2">
            <SidebarProfileButton />
            <SidebarNotificationButton />
          </div>
        </motion.div>

        {/* 가장자리(하단) 드래그 핸들 — 사이드바의 세로 핸들과 대칭 */}
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          role="separator"
          aria-orientation="horizontal"
          className="absolute inset-x-0 bottom-0 flex h-4 cursor-ns-resize touch-none items-center justify-center hover:bg-indigo-600/10"
        >
          <span className="h-0.5 w-7.5 rounded-full bg-indigo-800" />
        </motion.div>
      </motion.div>
    </>
  );
}
