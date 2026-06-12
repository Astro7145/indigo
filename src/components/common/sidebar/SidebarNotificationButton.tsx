'use client';

import type { ComponentPropsWithRef } from 'react';
import { IcBell } from '../icons';
import { useInfiniteNotificationList } from '@/src/hooks/notification';

export default function SidebarNotificationButton({ ...props }: ComponentPropsWithRef<'button'>) {
  const { data } = useInfiniteNotificationList({ limit: 100 });

  const notifications = data?.pages.flatMap((page) => page.notifications) ?? [];
  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <button
      type="button"
      aria-label="알림"
      {...props}
      className="flex aspect-square size-16 cursor-pointer items-center justify-center rounded-sm border border-indigo-600 bg-indigo-800/20 transition-shadow hover:shadow-[inset_0_0_8px_0_rgba(255,255,255,0.4)]"
    >
      <IcBell className="text-white" state={hasUnread ? 'unread' : 'read'} />
    </button>
  );
}
