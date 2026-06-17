'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { cn } from '@/src/utils/cn';

// 입력 중(input/textarea/contenteditable)에는 단축키가 글자 입력을 가로채지 않도록 제외한다
const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
};
import { useTodoSheet } from '@/src/hooks/useTodoSheet';
import { useModalStore } from '@/src/stores/modal';
import GoalSidebarList from '@/src/components/goal/GoalSidebarList';
import { IcDoubleArrow, LogoFull } from '../icons';
import LogoutButton from './LogoutButton';
import SidebarRow from './SidebarRow';
import SidebarProfileButton from './SidebarProfileButton';
import SidebarNotification from './SidebarNotification';
import TodoAddButton from './TodoAddButton';
import { useSettingsModalStore } from '@/src/stores/settingsModal';
import { usePathname } from 'next/navigation';

const TABLET_QUERY = '(max-width: 1280px)';

export default function Sidebar() {
  const t = useTranslations('sidebar');
  const { openCreate } = useTodoSheet();

  // 새 할일 N 단축키 — 사이드바는 모든 뷰포트에서 항상 마운트(hidden sm:contents)라 전역 리스너의
  // 단일 거처다. 버튼(TodoAddButton)에 두면 접힘 시 언마운트로 단축키가 죽어서 컴포넌트 본문에 둔다.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
      if (event.key !== 'n' && event.key !== 'N') return;
      if (isTypingTarget(event.target)) return;
      // 모달이 떠 있는 동안은 무시 — 모달 안 포커스(닫기 버튼 등)는 typing 가드에 안 걸려
      // N이 열린 폼 위에 생성 폼을 계속 적층한다
      if (useModalStore.getState().modals.length > 0) return;
      event.preventDefault();
      openCreate();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openCreate]);
  const path = usePathname();
  const openSettings = useSettingsModalStore((s) => s.open);

  const [collapsed, setCollapsed] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

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

  // 태블릿에서 사이드바가 펼쳐지면(오버레이+백드롭) 배경 스크롤을 잠근다
  useEffect(() => {
    if (!isTablet || collapsed) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isTablet, collapsed]);

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
            onClick={() => setCollapsed(true)}
            className="fixed inset-0 z-40 bg-black/40"
          />
        )}
      </AnimatePresence>
      {isTablet && <span className="w-18 shrink-0" />}
      <aside
        className={cn(
          'bg-indigo-dark-200 top-0 left-0 z-50 h-screen w-fit overflow-hidden',
          isTablet ? 'fixed' : 'sticky',
        )}
      >
        <div
          className={cn(
            'flex h-full flex-col gap-y-8',
            collapsed ? (isTablet ? 'px-2.5 py-8' : 'px-3 py-8') : 'px-8 pt-8 pb-16',
          )}
        >
          {/* 고정 헤더: 로고 + 접기 토글 (스크롤 영향 없음) */}
          <div className="flex shrink-0 items-center justify-between">
            {collapsed ? null : <LogoFull type="white" />}
            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              aria-label={collapsed ? t('expand') : t('collapse')}
              className="flex size-13 shrink-0 cursor-pointer items-center justify-center rounded-md p-1 text-slate-300 transition-colors hover:bg-white/10 hover:text-slate-50"
            >
              <IcDoubleArrow state={collapsed ? 'expand' : 'fold'} />
            </button>
          </div>
          {/* 스크롤 영역: 내비~로그아웃 (헤더·푸터는 고정). gutter 예약으로 스크롤바 등장 시 가로 흔들림 방지 */}
          <div className="scrollbar-slate flex min-h-0 flex-1 scrollbar-gutter-stable flex-col gap-y-8 overflow-y-auto">
            <ul className="flex flex-col gap-y-3">
              <SidebarRow
                type="dashboard"
                text={t('nav.dashboard')}
                href="/"
                current={path === '/'}
                collapsed={collapsed}
              />
              <GoalSidebarList
                collapsed={collapsed}
                onExpand={() => setCollapsed(false)}
                onSelected={() => {
                  if (isTablet) setCollapsed(true);
                }}
              />
              <SidebarRow
                type="calendar"
                text={t('nav.calendar')}
                href="/calendar"
                current={path === '/calendar'}
                collapsed={collapsed}
              />
              <SidebarRow
                type="posts"
                text={t('nav.posts')}
                href="/posts"
                current={path.startsWith('/posts')}
                collapsed={collapsed}
              />
              <SidebarRow
                type="favorites"
                text={t('nav.favorites')}
                href="/favorites"
                current={path === '/favorites'}
                collapsed={collapsed}
              />
            </ul>
            <ul className="flex flex-col">
              <SidebarRow type="settings" text={t('nav.settings')} onClick={openSettings} collapsed={collapsed} />
              <LogoutButton collapsed={collapsed} />
            </ul>
          </div>
          {!collapsed && (
            // 고정 푸터: 새할일 + 프로필 (outer gap-y-8로 스크롤 영역과 간격)
            <div className="flex shrink-0 flex-col gap-y-8">
              <TodoAddButton
                onClick={() => {
                  openCreate();
                  // 태블릿 오버레이 사이드바는 폼을 가리지 않도록 함께 접는다 (목표 선택과 동일 동작)
                  if (isTablet) setCollapsed(true);
                }}
              />
              <div className="flex gap-x-2">
                <SidebarProfileButton />
                <SidebarNotification />
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
