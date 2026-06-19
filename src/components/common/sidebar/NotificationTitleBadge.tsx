'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { useInfiniteNotificationList } from '@/src/hooks/notification';

/**
 * 기존 "(N) " prefix를 벗긴 뒤 count>0이면 다시 붙인다. 여러 번 적용해도 같은 결과(idempotent).
 */
export function applyUnreadPrefix(title: string, count: number): string {
  const base = title.replace(/^\(\d+\+?\)\s/, '');
  if (count <= 0) return base;
  return `(${count >= 100 ? '99+' : count}) ${base}`;
}

/**
 * 안 읽은 알림 개수를 브라우저 탭 타이틀 앞에 "(N) "로 덧붙인다(UI 없음).
 *
 * 벨과 동일한 쿼리(useInfiniteNotificationList limit=100)를 재사용해 캐시를 공유하므로
 * 추가 요청이 없고, 읽음/삭제 뮤테이션의 invalidate가 반영돼 실시간 갱신된다.
 *
 * base 타이틀은 Next 메타데이터가 라우트마다 새로(접두 없이) 설정하므로, MutationObserver로
 * <title> 변경을 감지해 prefix를 재적용한다(effect 의존성만으론 네비게이션 직후 누락 가능).
 * 목표 문자열과 현재가 같을 때는 건드리지 않아 observer 무한 루프를 막는다.
 */
export default function NotificationTitleBadge() {
  const pathname = usePathname();
  const { data } = useInfiniteNotificationList({ limit: 100 });
  const unreadCount = data?.pages.flatMap((page) => page.notifications).filter((n) => !n.isRead).length ?? 0;

  useEffect(() => {
    const titleEl = document.querySelector('title');
    if (!titleEl) return;

    const apply = () => {
      const desired = applyUnreadPrefix(document.title, unreadCount);
      if (document.title !== desired) document.title = desired;
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(titleEl, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [unreadCount, pathname]);

  return null;
}
