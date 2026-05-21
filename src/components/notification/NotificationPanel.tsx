'use client'

import type {
  Notification,
  NotificationListResponse,
} from '@/src/types/notification'
import type { CursorParams } from '@/src/types/common'
import {
  useInfiniteNotificationList,
  useReadAllNotifications,
  useUpdateNotification,
} from '@/src/hooks/notification'
import NotificationItem from './NotificationItem'

/** data 필드에서 댓글 서브텍스트를 안전하게 추출합니다. */
function extractSubtext(notification: Notification): string | undefined {
  if (!notification.data || typeof notification.data !== 'object')
    return undefined
  const data = notification.data as Record<string, unknown>
  const candidate = data.comment ?? data.content ?? data.body
  return typeof candidate === 'string' ? candidate : undefined
}

type NotificationPanelProps = {
  /**
   * 페이지 데이터를 가져오는 함수.
   * 기본값은 실제 API(`getNotifications`).
   * 개발용 미리보기에서 mock 데이터를 주입할 때 사용합니다.
   */
  queryFn?: (params: CursorParams) => Promise<NotificationListResponse>
}

/**
 * 알림 드롭다운 패널.
 *
 * 알림 목록을 무한 스크롤로 보여주며, 개별 알림 클릭 시 읽음 처리,
 * "모두 읽기" 버튼으로 일괄 읽음 처리를 지원합니다.
 *
 * 알림이 없을 때는 빈 상태 메시지를 표시합니다.
 */
export default function NotificationPanel({
  queryFn,
}: NotificationPanelProps = {}) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteNotificationList({ limit: 5 }, queryFn)

  const { mutate: readAll, isPending: isReadingAll } = useReadAllNotifications()
  const { mutate: updateNotification } = useUpdateNotification()

  const notifications = data?.pages.flatMap((page) => page.notifications) ?? []
  const hasNotifications = notifications.length > 0
  const hasUnread = notifications.some((n) => !n.isRead)

  function handleItemClick(notification: Notification) {
    if (!notification.isRead) {
      updateNotification({
        notificationId: notification.id,
        body: { isRead: true },
      })
    }
  }

  function handleReadAll() {
    if (hasUnread && !isReadingAll) readAll()
  }

  return (
    <section
      aria-label="알림"
      className="w-72 overflow-hidden rounded border border-slate-200 bg-white px-3 py-5 shadow-[0px_0px_30px_0px_rgba(0,0,0,0.05)]"
    >
      {/* 헤더 */}
      <div className="mb-4 flex items-center justify-between px-2">
        <h2 className="text-sm leading-5 font-semibold tracking-[-0.03em] text-slate-700">
          알림
        </h2>
        <button
          type="button"
          onClick={handleReadAll}
          disabled={!hasUnread || isReadingAll}
          aria-label="모든 알림을 읽음으로 표시"
          className="text-xs leading-4 font-semibold text-indigo-500 transition-colors disabled:cursor-not-allowed disabled:text-slate-300"
        >
          모두 읽기
        </button>
      </div>

      {/* 알림 목록 또는 빈 상태 */}
      {hasNotifications ? (
        <ul
          aria-label="알림 목록"
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
                aria-label="이전 알림 더 불러오기"
                className="text-xs text-slate-400 transition-colors hover:text-slate-600 disabled:cursor-not-allowed"
              >
                {isFetchingNextPage ? '불러오는 중...' : '더 보기'}
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
          아직 알림이 없어요
        </div>
      )}
    </section>
  )
}
