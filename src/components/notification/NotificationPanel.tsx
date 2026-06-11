'use client';

import { useTranslations } from 'next-intl';

import type { Notification, NotificationListResponse } from '@/src/types/notification';
import type { CursorParams } from '@/src/types/common';
import {
  useInfiniteNotificationList,
  useRefreshNotifications,
  useReadAllNotifications,
  useDeleteAllNotifications,
  useUpdateNotification,
} from '@/src/hooks/notification';
import { IcRefresh } from '@/src/components/common/icons';
import NotificationItem from './NotificationItem';

/** 댓글 알림이면 댓글 내용을 서브텍스트로 추출합니다. */
function extractSubtext(notification: Notification): string | undefined {
  if (notification.type === 'comment') return notification.data.commentContent;
  return undefined;
}

type NotificationPanelProps = {
  /**
   * 페이지 데이터를 가져오는 함수.
   * 기본값은 실제 API(`getNotifications`).
   * 개발용 미리보기에서 mock 데이터를 주입할 때 사용합니다.
   */
  queryFn?: (params: CursorParams) => Promise<NotificationListResponse>;
};

/**
 * 알림 드롭다운 패널.
 *
 * 알림 목록을 무한 스크롤로 보여주며, 개별 알림 클릭 시 읽음 처리,
 * "모두 읽기" 버튼으로 일괄 읽음 처리를 지원합니다.
 *
 * 알림이 없을 때는 빈 상태 메시지를 표시합니다.
 */
export default function NotificationPanel({ queryFn }: NotificationPanelProps = {}) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteNotificationList({ limit: 5 }, queryFn);
  const t = useTranslations('sidebar');
  const tc = useTranslations('common');

  const { mutate: readAll, isPending: isReadingAll } = useReadAllNotifications();
  const { mutate: deleteAll, isPending: isDeletingAll } = useDeleteAllNotifications();
  const { mutate: updateNotification } = useUpdateNotification();
  const refreshNotifications = useRefreshNotifications();

  const notifications = data?.pages.flatMap((page) => page.notifications) ?? [];
  const hasNotifications = notifications.length > 0;
  const hasUnread = notifications.some((n) => !n.isRead);

  function handleItemClick(notification: Notification) {
    if (!notification.isRead) {
      updateNotification({
        notificationId: notification.id,
        body: { isRead: true },
      });
    }
  }

  function handleReadAll() {
    if (hasUnread && !isReadingAll) readAll();
  }

  function handleDeleteAll() {
    if (hasNotifications && !isDeletingAll) deleteAll();
  }

  return (
    <section
      aria-label={t('notification.title')}
      className="w-72 overflow-hidden rounded border border-slate-200 bg-white px-3 py-5 shadow-md"
    >
      {/* 헤더 */}
      <div className="mb-4 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm leading-5 font-semibold tracking-[-0.03em] text-slate-700">
            {t('notification.title')}
          </h2>
          <button
            type="button"
            onClick={refreshNotifications}
            aria-label={t('notification.refresh')}
            className="cursor-pointer text-slate-300 transition-colors hover:text-slate-500"
          >
            <IcRefresh className="size-4 text-inherit" />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleDeleteAll}
            disabled={!hasNotifications || isDeletingAll}
            aria-label={t('notification.deleteAll')}
            className="text-destructive/80 hover:text-destructive hover:bg-destructive/20 cursor-pointer rounded-lg px-2 py-1 text-xs leading-4 font-semibold transition-colors disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
          >
            {t('notification.deleteAll')}
          </button>
          <button
            type="button"
            onClick={handleReadAll}
            disabled={!hasUnread || isReadingAll}
            aria-label={t('notification.readAllLabel')}
            className="cursor-pointer rounded-lg px-2 py-1 text-xs leading-4 font-semibold text-indigo-500 transition-colors hover:bg-indigo-500/20 hover:text-indigo-600 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            {t('notification.readAll')}
          </button>
        </div>
      </div>

      {/* 알림 목록 또는 빈 상태 */}
      {hasNotifications ? (
        <ul
          aria-label={t('notification.listLabel')}
          aria-live="polite"
          className="scrollbar-slate -mr-2 flex max-h-90 flex-col gap-2 overflow-y-auto"
        >
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              subtext={extractSubtext(notification)}
              onClick={handleItemClick}
            />
          ))}
          {hasNextPage && (
            <li className="flex justify-center py-2">
              <button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                aria-label={t('notification.loadMoreLabel')}
                className="text-xs text-slate-400 transition-colors hover:text-slate-600 disabled:cursor-not-allowed"
              >
                {isFetchingNextPage ? tc('state.loading') : t('notification.loadMore')}
              </button>
            </li>
          )}
        </ul>
      ) : (
        <div
          role="status"
          aria-live="polite"
          className="pt-12 pb-14 text-center text-sm leading-5 font-medium tracking-[-0.03em] text-slate-500"
        >
          {t('notification.empty')}
        </div>
      )}
    </section>
  );
}
