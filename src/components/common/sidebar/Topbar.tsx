'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePageTitle } from '@/src/hooks/usePageTitle';
import { useTodoSheet } from '@/src/hooks/useTodoSheet';
import GoalSidebarList from '@/src/components/goal/GoalSidebarList';
import { useTopbarSlotStore } from '@/src/stores/topbarSlot';
import { IcHamburger, LogoFull } from '../icons';
import LogoutButton from './LogoutButton';
import SidebarNotificationButton from './SidebarNotificationButton';
import SidebarProfileButton from './SidebarProfileButton';
import SidebarRow from './SidebarRow';
import TodoAddButton from './TodoAddButton';
import { useSettingsModalStore } from '@/src/stores/settingsModal';
import TopbarNotification from './TopbarNotification';

const COLLAPSED_HEIGHT = 56; // 접힘 바 높이 — 본문 자리표시 h-14(56)와 일치
const SPRING = { type: 'spring', stiffness: 300, damping: 30 } as const;

// 폼 페이지 경로 — 진입 시 곧 슬롯이 등록되므로 첫 페인트에 fallback(종)을 띄우지 않고 빈 자리를 둔다.
// 이 가드 없이 fallback을 두면 페이지 mount 전에 종 → 슬롯 액션으로 갈아끼는 한 프레임 깜빡임이 생긴다.
const FORM_ROUTE_PATTERNS: RegExp[] = [
  /^\/posts\/write$/,
  /^\/posts\/[^/]+\/edit$/,
  /^\/todos\/[^/]+\/notes\/(write|edit)$/,
];

export default function Topbar() {
  const t = useTranslations('sidebar');
  const title = usePageTitle();
  const pathname = usePathname();
  const rightSlot = useTopbarSlotStore((s) => s.rightSlot);
  const { openCreate } = useTodoSheet();
  const openSettings = useSettingsModalStore((s) => s.open);
  const isFormRoute = FORM_ROUTE_PATTERNS.some((p) => p.test(pathname));
  const [expandedHeight, setExpandedHeight] = useState(0);
  const [collapsed, setCollapsed] = useState(true);

  // 펼친 높이 = 뷰포트 높이 (전체 화면 메뉴)
  useEffect(() => {
    const update = () => setExpandedHeight(window.innerHeight);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // 모바일에서 탑바가 펼쳐지면(오버레이+백드롭) 배경 스크롤을 잠근다
  useEffect(() => {
    if (collapsed) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [collapsed]);

  // 메뉴를 여는 버튼은 후속 작업에서 추가한다 (#171). 닫기는 메뉴 내부 항목에서 호출한다.
  const collapse = () => setCollapsed(true);

  return (
    <>
      {/* 접힌 높이만큼 자리를 차지해 본문이 바 아래에서 시작하도록 한다 */}
      <div aria-hidden className="h-14 shrink-0 md:hidden" />

      <motion.div
        initial={false}
        animate={{ height: collapsed ? COLLAPSED_HEIGHT : expandedHeight }}
        transition={SPRING}
        className="bg-indigo-dark-200 fixed inset-x-0 top-0 z-50 flex flex-col overflow-hidden sm:hidden"
      >
        {/* 접힘 상태: 인사말 + 우측 슬롯(기본 알림, 페이지가 등록 시 액션) */}
        <motion.div
          initial={false}
          animate={{ opacity: collapsed ? 1 : 0 }}
          // inert: 펼침 상태에선 접힘 바를 비활성화(포커스·AT·포인터 제거). aria-hidden은 내부 버튼이
          // 포커스를 쥔 채 막혀 경고가 나므로 inert를 쓴다(포커스도 함께 빠져나간다).
          inert={!collapsed}
          className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-4"
        >
          <div className="flex items-center gap-x-2">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label={t('menuExpand')}
              className="pointer-events-auto flex cursor-pointer"
            >
              <IcHamburger className="text-slate-50" />
            </button>
            <span className="text-base font-semibold text-slate-50">{title}</span>
          </div>
          {isFormRoute ? (
            // 폼 페이지: 등록된 액션 버튼(슬롯)이 알림 종을 대체. 슬롯 등록 전 한 프레임은
            // 빈 자리를 둬서 fallback(종) → 액션 갈아끼는 깜빡임을 막는다.
            // 슬롯 내부 버튼은 접힘 바 위에서 클릭 가능해야 함 (부모의 pointer-events-none 해제)
            rightSlot ? (
              <div className="pointer-events-auto relative z-10">{rightSlot}</div>
            ) : (
              <span aria-hidden />
            )
          ) : (
            // 그 외(대시보드 등): 알림 종을 유지하고, 페이지 슬롯(예: 그래프 토글)을 종 좌측에 둔다
            <div className="pointer-events-auto relative z-10 flex items-center gap-x-4">
              {rightSlot}
              <TopbarNotification active={collapsed} />
            </div>
          )}
        </motion.div>
        {/* 펼침 상태: 사이드바와 동일한 메뉴 */}
        <motion.div
          initial={false}
          animate={{ opacity: collapsed ? 0 : 1 }}
          // 접힘 상태에선 펼침 메뉴를 inert 처리. 메뉴 접기 버튼이 포커스를 쥔 채 aria-hidden이
          // 막히던 경고를 해소한다(inert가 포커스를 빼낸다).
          inert={collapsed}
          className={`flex h-full min-h-0 flex-col gap-y-8 px-5 pt-4 pb-12 ${
            !collapsed ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          {/* 고정 헤더: 로고 + 접기 토글 (스크롤 영향 없음, 데스크탑 사이드바와 동일) */}
          <div className="flex shrink-0 items-center justify-between">
            <LogoFull type="white" />
            <button
              type="button"
              onClick={collapse}
              aria-label={t('menuCollapse')}
              className="flex size-13 shrink-0 cursor-pointer items-center justify-center rounded-md p-1 text-slate-300 transition-colors hover:bg-white/10 hover:text-slate-50"
            >
              <IcHamburger className="size-8 text-current" />
            </button>
          </div>
          {/* 스크롤 영역: 내비~로그아웃 (헤더·푸터는 고정). gutter 예약으로 스크롤바 등장 시 가로 흔들림 방지 */}
          <div className="scrollbar-slate flex min-h-0 flex-1 scrollbar-gutter-stable flex-col gap-y-8 overflow-y-auto">
            <ul className="flex flex-col gap-y-3">
              <Link href="/" className="group" onClick={collapse}>
                <SidebarRow type="dashboard" text={t('nav.dashboard')} />
              </Link>
              <GoalSidebarList onSelected={collapse} />
              <Link href="/calendar" className="group" onClick={collapse}>
                <SidebarRow type="calendar" text={t('nav.calendar')} />
              </Link>
              <Link href="/posts" className="group" onClick={collapse}>
                <SidebarRow type="posts" text={t('nav.posts')} />
              </Link>
              <Link href="/favorites" className="group" onClick={collapse}>
                <SidebarRow type="favorites" text={t('nav.favorites')} />
              </Link>
            </ul>
            <div className="flex flex-col">
              <SidebarRow
                type="settings"
                text={t('nav.settings')}
                onClick={() => {
                  collapse();
                  openSettings();
                }}
              />
              <LogoutButton />
            </div>
          </div>

          {/* 고정 푸터: 새할일 + 프로필 (outer gap-y-8로 스크롤 영역과 간격) */}
          <div className="flex shrink-0 flex-col gap-y-4">
            <TodoAddButton
              onClick={() => {
                // 전체화면 메뉴를 접어 폼(바텀시트)이 그 위로 올라오게 한다
                collapse();
                openCreate();
              }}
            />
            <div className="flex gap-x-2">
              <SidebarProfileButton />
              <SidebarNotificationButton />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
