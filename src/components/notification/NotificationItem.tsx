'use client';

import { useTranslations } from 'next-intl';
import type { Notification } from '@/src/types/notification';
import { cn } from '@/src/utils/cn';
import Image from 'next/image';

export interface NotificationItemProps {
  notification: Notification;
  /** 댓글 등 부가 내용 (한 줄 말줄임 표시) */
  subtext?: string;
  onClick?: (notification: Notification) => void;
}

type CommonT = ReturnType<typeof useTranslations<'common'>>;

// 모듈 레벨 순수 함수 — Date.now()는 인수로 받는 tc와 함께 컴포넌트 렌더 밖에서 호출된다
function formatRelativeTime(dateStr: string, tc: CommonT): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);
  const weeks = Math.floor(days / 7);

  if (minutes < 1) return tc('relativeTime.justNow');
  if (minutes < 60) return tc('relativeTime.minutes', { count: minutes });
  if (hours < 24) return tc('relativeTime.hours', { count: hours });
  if (days < 7) return tc('relativeTime.days', { count: days });
  if (weeks < 5) return tc('relativeTime.weeks', { count: weeks });
  return tc('relativeTime.months', { count: Math.floor(days / 30) });
}

/**
 * 단일 알림 행 컴포넌트.
 *
 * NotificationPanel 내부에서 사용되며, isRead 상태에 따라 인디케이터 점 표시 여부를 결정합니다.
 * 클릭 시 onClick 콜백을 호출하며, 키보드(Enter/Space)로도 동작합니다.
 */
export default function NotificationItem({ notification, subtext, onClick }: NotificationItemProps) {
  const t = useTranslations('sidebar');
  const tc = useTranslations('common');
  const { isRead, message, createdAt, data } = notification;
  const isInteractive = Boolean(onClick);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(notification);
    }
  }

  return (
    <li
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={isRead ? message : t('notification.unreadLabel', { message })}
      onClick={() => onClick?.(notification)}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      className={cn(
        'flex items-start gap-2 rounded px-2 py-3 transition-colors',
        isInteractive && 'cursor-pointer hover:bg-slate-50 focus-visible:ring-2 focus-visible:outline-none',
      )}
    >
      {/* 읽지 않은 알림 인디케이터 */}
      <span
        aria-hidden="true"
        className={cn(
          'mt-1 flex size-3 shrink-0 items-center justify-center rounded-full transition-opacity before:size-1.5 before:rounded-full',
          isRead ? 'before:opacity-0' : 'before:bg-indigo-500',
        )}
      />

      {/* 본문 + 아바타 */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-col gap-0.5 text-sm leading-5 tracking-[-0.03em]">
            <p className={cn('font-medium wrap-break-word text-slate-700', !subtext && 'line-clamp-2')}>{message}</p>
            {subtext && <p className="truncate font-normal text-slate-500">{subtext}</p>}
          </div>
          <p className="text-xs leading-4 text-slate-400">{formatRelativeTime(createdAt, tc)}</p>
        </div>

        {/* 아바타 (장식 이미지) */}
        <div
          aria-hidden="true"
          className="relative size-10 shrink-0 overflow-hidden rounded-full border border-slate-200"
        >
          {data?.userImage ? (
            // 아바타 외부 도메인은 가변적 — next.config images.remotePatterns에서 https 전체 허용
            <Image src={data.userImage} alt={t('notification.avatarAlt')} fill sizes="40px" className="object-cover" />
          ) : (
            <div className="size-full bg-slate-100" />
          )}
        </div>
      </div>
    </li>
  );
}
