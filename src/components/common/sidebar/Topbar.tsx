'use client';

import { animate, motion, useMotionValue, useTransform } from 'motion/react';
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
  const [expanded, setExpanded] = useState(false);
  const height = useMotionValue(COLLAPSED_HEIGHT);

  // 이벤트 핸들러에서 stale closure 없이 최신값에 접근하기 위해 ref로 관리
  const expandedHeightRef = useRef(0);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const dragStartHeight = useRef(COLLAPSED_HEIGHT);

  const barOpacity = useTransform(height, [COLLAPSED_HEIGHT, COLLAPSED_HEIGHT + 80], [1, 0]);
  const menuOpacity = useTransform(height, [COLLAPSED_HEIGHT + 60, COLLAPSED_HEIGHT + 200], [0, 1]);

  // 펼친 높이 = 뷰포트 높이 (전체 화면 메뉴)
  useEffect(() => {
    const update = () => {
      const next = window.innerHeight;
      expandedHeightRef.current = next;
      if (height.get() > COLLAPSED_HEIGHT) height.set(next);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [height]);

  // 태블릿에서 사이드바가 펼쳐지면(오버레이+백드롭) 배경 스크롤을 잠근다
  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [expanded]);

  const expand = () => {
    setExpanded(true);
    animate(height, expandedHeightRef.current, SPRING);
  };

  const collapse = () => {
    setExpanded(false);
    animate(height, COLLAPSED_HEIGHT, SPRING);
  };

  // setPointerCapture: 포인터가 요소 밖으로 나가도 pointermove/up 이벤트를 이 요소에서 수신
  // → Motion drag 대비 모바일에서 포인터 캡처가 안정적으로 유지됨
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true;
    startY.current = e.clientY;
    dragStartHeight.current = height.get();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const delta = e.clientY - startY.current;
    height.set(clamp(dragStartHeight.current + delta, COLLAPSED_HEIGHT, expandedHeightRef.current));
  };

  // pointerup / pointercancel 공통 처리: 중간 지점 기준으로 펼침/접힘 스냅
  const handlePointerEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (height.get() > (COLLAPSED_HEIGHT + expandedHeightRef.current) / 2) expand();
    else collapse();
  };

  const dragHandlers = {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerEnd,
    onPointerCancel: handlePointerEnd,
  } as const;

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

        {/* 접힌 상태 전용 드래그 레이어 — 바 전체를 터치 타깃으로 커버 */}
        {!expanded && <div aria-hidden className="absolute inset-0 touch-none" {...dragHandlers} />}

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

        {/* 드래그 핸들 — h-12(48px)로 모바일 터치 타깃 확보, 시각 인디케이터는 하단 고정 */}
        <div
          role="separator"
          aria-orientation="horizontal"
          className="absolute inset-x-0 bottom-0 flex h-12 cursor-ns-resize touch-none items-end justify-center pb-1.5 hover:bg-indigo-600/10"
          {...dragHandlers}
        >
          <span className="h-0.5 w-7.5 rounded-full bg-indigo-800" />
        </div>
      </motion.div>
    </>
  );
}
