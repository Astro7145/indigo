import { useCallback } from 'react';
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
  type Query,
} from '@tanstack/react-query';
import {
  notificationKeys,
  getNotifications,
  readAllNotifications,
  deleteAllNotifications,
  patchNotification,
  deleteNotification,
} from '@/src/api/notification';
import type { Notification, NotificationListResponse, UpdateNotificationBody } from '@/src/types/notification';
import type { CursorParams, ApiError } from '@/src/types/common';

export function useNotificationList(params: CursorParams = {}) {
  return useQuery<NotificationListResponse, ApiError>({
    queryKey: notificationKeys.list(params),
    queryFn: () => getNotifications(params),
  });
}

export function useInfiniteNotificationList(
  params: Omit<CursorParams, 'cursor'> = {},
  overrideQueryFn?: (params: CursorParams) => Promise<NotificationListResponse>,
) {
  return useInfiniteQuery<NotificationListResponse, ApiError>({
    queryKey: [...notificationKeys.list(params), 'infinite'],
    queryFn: ({ pageParam }) =>
      (overrideQueryFn ?? getNotifications)({
        ...params,
        cursor: pageParam as number | undefined,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    refetchOnMount: 'always',
  });
}

/**
 * 알림 무한 목록을 "첫 페이지만 남기고" 새로고침하는 콜백을 반환한다.
 * 캐시에 2페이지 이상 쌓여 있으면 첫 페이지만 남기고 나머지를 버린 뒤,
 * 남은 첫 페이지를 서버에서 다시 불러온다.
 */
export function useRefreshNotifications() {
  const qc = useQueryClient();
  return useCallback(() => {
    // 알림 "무한 쿼리"(키 끝이 'infinite')만 대상으로 한다
    const infiniteFilter = {
      queryKey: notificationKeys.lists(),
      predicate: (query: Query) => query.queryKey[query.queryKey.length - 1] === 'infinite',
    };
    // 첫 페이지만 남기고 나머지 페이지를 잘라낸다 (2페이지 이상일 때만 변경)
    qc.setQueriesData<InfiniteData<NotificationListResponse>>(infiniteFilter, (data) => {
      if (!data || data.pages.length <= 1) return data;
      return {
        ...data,
        pages: data.pages.slice(0, 1),
        pageParams: data.pageParams.slice(0, 1),
      };
    });
    // 남은 첫 페이지를 다시 불러온다
    qc.invalidateQueries(infiniteFilter);
  }, [qc]);
}

export function useReadAllNotifications() {
  const qc = useQueryClient();
  return useMutation<void, ApiError, void>({
    mutationFn: () => readAllNotifications(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
}

export function useDeleteAllNotifications() {
  const qc = useQueryClient();
  return useMutation<void, ApiError, void>({
    mutationFn: () => deleteAllNotifications(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
}

export function useUpdateNotification() {
  const qc = useQueryClient();
  return useMutation<Notification, ApiError, { notificationId: number; body: UpdateNotificationBody }>({
    mutationFn: ({ notificationId, body }) => patchNotification(notificationId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation<void, ApiError, number>({
    mutationFn: (id) => deleteNotification(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
}
