'use client';

import { useEffect, useRef, useState } from 'react';

import NotificationPanel from '@/src/components/notification/NotificationPanel';
import SidebarNotificationButton from './SidebarNotificationButton';

/**
 * 사이드바 알림 버튼 + 떠 있는 NotificationPanel.
 *
 * 버튼을 누르면 패널이 버튼 바로 위에 floating(position: absolute) 상태로 열리고,
 * 바깥 클릭 또는 Escape로 닫힌다.
 *
 * 패널은 사이드바 <aside>의 overflow 안에 머무르므로, 너비가 사이드바를 넘지 않도록
 * 버튼 우측 기준(right-0)으로 정렬해 위로 펼친다(bottom-full).
 */
export default function SidebarNotification() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = () => setIsOpen(false);

  // 바깥(버튼·패널 영역 밖) 클릭 시 닫힘
  useEffect(() => {
    if (!isOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen]);

  // Escape 시 닫힘 + 트리거 포커스 복귀
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <SidebarNotificationButton
        ref={triggerRef}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      />
      {isOpen && (
        <div className="absolute bottom-0 left-full z-50 ml-2">
          <NotificationPanel />
        </div>
      )}
    </div>
  );
}
