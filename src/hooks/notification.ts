import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  notificationKeys,
  getNotifications,
  readAllNotifications,
  deleteAllNotifications,
  patchNotification,
  deleteNotification,
} from '@/src/api/notification'
import type {
  Notification,
  NotificationListResponse,
  UpdateNotificationBody,
} from '@/src/types/notification'
import type { CursorParams, ApiError } from '@/src/types/common'

export function useNotificationList(params: CursorParams = {}) {
  return useQuery<NotificationListResponse, ApiError>({
    queryKey: notificationKeys.list(params),
    queryFn: () => getNotifications(params),
  })
}

export function useInfiniteNotificationList(
  params: Omit<CursorParams, 'cursor'> = {},
) {
  return useInfiniteQuery<NotificationListResponse, ApiError>({
    queryKey: [...notificationKeys.list(params), 'infinite'],
    queryFn: ({ pageParam }) =>
      getNotifications({ ...params, cursor: pageParam as number | undefined }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  })
}

export function useReadAllNotifications() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, void>({
    mutationFn: () => readAllNotifications(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.lists() })
    },
  })
}

export function useDeleteAllNotifications() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, void>({
    mutationFn: () => deleteAllNotifications(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.lists() })
    },
  })
}

export function useUpdateNotification() {
  const qc = useQueryClient()
  return useMutation<
    Notification,
    ApiError,
    { notificationId: number; body: UpdateNotificationBody }
  >({
    mutationFn: ({ notificationId, body }) =>
      patchNotification(notificationId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.lists() })
    },
  })
}

export function useDeleteNotification() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, number>({
    mutationFn: (id) => deleteNotification(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.lists() })
    },
  })
}
