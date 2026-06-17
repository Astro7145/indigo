// SERVER-ONLY: 메타데이터 title prefix용 안 읽은 알림 개수 조회.
import { cache } from 'react';

import { serverGet } from '@/src/api/server/server-get';
import type { NotificationListResponse } from '@/src/types/notification';

/**
 * 안 읽은 알림 개수. 벨 UI(SidebarNotificationButton)와 동일하게 limit=100을 한 번 페치해
 * isRead=false를 센다(>100 안읽음은 벨 UI와 동일한 한계). 미인증·실패 시 serverGet이
 * throw하므로 0을 반환한다. cache로 같은 요청 내 중복 호출(root·posts/[postId]
 * generateMetadata)을 1회로 합친다.
 */
export const getUnreadNotificationCount = cache(async (): Promise<number> => {
  try {
    const data = await serverGet<NotificationListResponse>('notifications', { limit: 100 });
    return data.notifications.filter((n) => !n.isRead).length;
  } catch {
    return 0;
  }
});

/** count가 0이면 빈 문자열, 그 외 "(N) " — 타이틀 prefix. */
export const notificationTitlePrefix = (count: number): string => (count > 0 ? `(${count}) ` : '');
