'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import NotificationPanel from '@/src/components/notification/NotificationPanel';
import { IcBell } from '../icons';
import { useInfiniteNotificationList } from '@/src/hooks/notification';

interface TopbarNotificationProps {
  /** 탑바 접힘 상태에서만 상호작용/표시 가능. 펼치면(false) 팝오버를 자동으로 닫는다. */
  active: boolean;
}

/**
 * 탑바(접힘 상태) 알림 벨 + 떠 있는 NotificationPanel.
 *
 * 벨을 누르면 패널이 탑바 아래에 floating(position: fixed) 상태로 열리고,
 * 바깥 클릭 또는 Escape로 닫힌다. SidebarNotification과 동일한 동작이다.
 *
 * 탑바 컨테이너가 overflow-hidden(높이 56px)이라 패널을 fixed로 띄워 잘림을 피한다.
 * (벨·패널이 pointer-events-none 영역 안에 있으므로 둘 다 pointer-events-auto로 되살린다)
 */
export default function TopbarNotification({ active }: TopbarNotificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prevActive, setPrevActive] = useState(active);
  const bellRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('sidebar');

  const close = () => setIsOpen(false);

  const { data } = useInfiniteNotificationList({ limit: 100 });

  const notifications = data?.pages.flatMap((page) => page.notifications) ?? [];
  const hasUnread = notifications.some((n) => !n.isRead);

  // 펼침(active=false)으로 바뀌면 팝오버를 닫는다 — effect 대신 렌더 중 보정
  if (prevActive !== active) {
    setPrevActive(active);
    if (!active) setIsOpen(false);
  }

  // 바깥(벨·패널 밖) 클릭 시 닫힘
  useEffect(() => {
    if (!isOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node) && !bellRef.current?.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen]);

  // Escape 시 닫힘 + 벨 포커스 복귀
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        bellRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        ref={bellRef}
        type="button"
        aria-label={t('notification.title')}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`cursor-pointer ${active ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        <IcBell state={hasUnread ? 'unread' : 'read'} className="size-5 text-slate-50" />
      </button>
      {isOpen && (
        <div ref={panelRef} className="pointer-events-auto fixed top-16 right-5 z-50 sm:hidden">
          <NotificationPanel />
        </div>
      )}
    </>
  );
}
