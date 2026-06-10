'use client';

import { animate, motion, useMotionValue, useTransform, type PanInfo } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { usePageTitle } from '@/src/hooks/usePageTitle';
import GoalSidebarList from '@/src/components/goal/GoalSidebarList';
import { useTopbarSlotStore } from '@/src/stores/topbarSlot';
import { LogoFull } from '../icons';
import LogoutButton from './LogoutButton';
import SidebarNotificationButton from './SidebarNotificationButton';
import SidebarProfileButton from './SidebarProfileButton';
import SidebarRow from './SidebarRow';
import TodoAddButton from './TodoAddButton';
import TodoFormSheet from '@/src/components/todo/TodoFormSheet';
import { useSettingsModalStore } from '@/src/stores/settingsModal';
import TopbarNotification from './TopbarNotification';

const COLLAPSED_HEIGHT = 56; // pt-4(16) + h-6(24) + 핸들 h-4(16)
const SPRING = { type: 'spring', stiffness: 300, damping: 30 } as const;

// 폼 페이지 경로 — 진입 시 곧 슬롯이 등록되므로 첫 페인트에 fallback(종)을 띄우지 않고 빈 자리를 둔다.
// 이 가드 없이 fallback을 두면 페이지 mount 전에 종 → 슬롯 액션으로 갈아끼는 한 프레임 깜빡임이 생긴다.
const FORM_ROUTE_PATTERNS: RegExp[] = [
  /^\/posts\/write$/,
  /^\/posts\/[^/]+\/edit$/,
  /^\/todos\/[^/]+\/notes\/(write|edit)$/,
];

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function Topbar() {
  const title = usePageTitle();
  const pathname = usePathname();
  const rightSlot = useTopbarSlotStore((s) => s.rightSlot);
  const openSettings = useSettingsModalStore((s) => s.open);
  const isFormRoute = FORM_ROUTE_PATTERNS.some((p) => p.test(pathname));
  const [expandedHeight, setExpandedHeight] = useState(0);
  const [collapsed, setCollapsed] = useState(true);
  // 새 할일 생성 폼(시트) 열림 상태 — 탑바가 소유.
  const [createOpen, setCreateOpen] = useState(false);
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

  // 모바일에서 탑바가 펼쳐지면(오버레이+백드롭) 배경 스크롤을 잠근다
  useEffect(() => {
    if (collapsed) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [collapsed]);

  const expand = () => {
    setCollapsed(false);
    animate(height, expandedHeight, SPRING);
  };

  const collapse = () => {
    setCollapsed(true);
    animate(height, COLLAPSED_HEIGHT, SPRING);
  };

  // 추후 사이드바 및 탑 바 드래그 기능 제거 예정
  const handleDragStart = () => {
    dragStartHeight.current = height.get();
  };

  const handleDrag = (_event: unknown, info: PanInfo) => {
    if (!expandedHeight) return;
    height.set(clamp(dragStartHeight.current + info.offset.y, COLLAPSED_HEIGHT, expandedHeight));
  };

  const handleDragEnd = () => {
    if (!expandedHeight) return;
    const range = expandedHeight - COLLAPSED_HEIGHT;
    const currentHeight = height.get();
    if (collapsed) {
      // collapsed 기준: 전체 범위의 25% 이상 아래로 드래그하면 expand
      if (currentHeight >= COLLAPSED_HEIGHT + range * 0.25) expand();
      else collapse();
    } else {
      // expanded 기준: 전체 범위의 25% 이상 위로 드래그하면 collapse
      if (currentHeight <= expandedHeight - range * 0.25) collapse();
      else expand();
    }
  };

  return (
    <>
      {/* 접힌 높이만큼 자리를 차지해 본문이 바 아래에서 시작하도록 한다 */}
      <div aria-hidden className="h-14 shrink-0 md:hidden" />

      <motion.div
        style={{ height }}
        className="fixed inset-x-0 top-0 z-50 flex flex-col overflow-hidden bg-[#1A1B2E] sm:hidden"
      >
        {/* 접힘 상태: 인사말 + 우측 슬롯(기본 알림, 페이지가 등록 시 액션) */}
        <motion.div
          style={{ opacity: barOpacity }}
          aria-hidden={!collapsed}
          className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-4"
        >
          <span className="text-base font-semibold text-slate-50">{title}</span>
          {rightSlot ? (
            // 슬롯 내부 버튼은 드래그 핸들과 별개로 클릭 가능해야 함
            // - pointer-events-auto: 부모의 pointer-events-none 해제
            // - relative z-10: 같은 부모 내 bottom 드래그 핸들이 JSX 뒤라 stacking 상 위에 깔리는 걸 해제
            <div className="pointer-events-auto relative z-10">{rightSlot}</div>
          ) : isFormRoute ? (
            // 폼 페이지는 곧 슬롯이 등록될 거라 빈 자리를 둬서 fallback(종) 깜빡임 방지
            <span aria-hidden />
          ) : (
            <TopbarNotification active={collapsed} />
          )}
        </motion.div>
        {/* 펼침 상태: 사이드바와 동일한 메뉴 */}
        <motion.div
          style={{ opacity: menuOpacity }}
          aria-hidden={collapsed}
          className={`flex h-full min-h-0 flex-col justify-between overflow-y-auto px-5 pt-4 pb-12 ${
            !collapsed ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          <div className="flex flex-col gap-y-8">
            <button type="button" onClick={collapse} aria-label="메뉴 접기" className="flex w-fit cursor-pointer">
              <LogoFull type="white" />
            </button>
            <ul className="flex flex-col gap-y-3">
              <Link href="/" className="group" onClick={collapse}>
                <SidebarRow type="dashboard" text="대시보드" />
              </Link>
              <GoalSidebarList onSelected={collapse} />
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
              <SidebarRow
                type="settings"
                text="설정"
                onClick={() => {
                  collapse();
                  openSettings();
                }}
              />
              <LogoutButton />
            </div>
          </div>

          <div className="flex flex-col gap-y-4">
            <TodoAddButton
              onClick={() => {
                // 전체화면 메뉴를 접어 폼(바텀시트)이 그 위로 올라오게 한다
                collapse();
                setCreateOpen(true);
              }}
            />
            <div className="flex gap-x-2">
              <SidebarProfileButton />
              <SidebarNotificationButton />
            </div>
          </div>
        </motion.div>
        {/* // 추후 사이드바 및 탑 바 드래그 기능 제거 예정 */}
        {/* 가장자리(하단) 드래그 핸들 — 사이드바의 세로 핸들과 대칭 */}
        {/* <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          role="separator"
          aria-orientation="horizontal"
          className="absolute inset-x-0 bottom-0 flex h-19 touch-none items-end justify-center pb-2"
        >
          {collapsed && <span className="h-0.5 w-12 rounded-full bg-indigo-800" />}
        </motion.div> */}
      </motion.div>

      <TodoFormSheet mode="create" isOpen={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
