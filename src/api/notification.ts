import instance from '@/src/api/axiosInstance';
import type { Notification, NotificationListResponse, UpdateNotificationBody } from '@/src/types/notification';
import type { CursorParams } from '@/src/types/common';

export const notificationKeys = {
  all: ['notification'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: CursorParams = {}) => [...notificationKeys.lists(), filters] as const,
};

export async function getNotifications(params: CursorParams = {}): Promise<NotificationListResponse> {
  const { data } = await instance.get<NotificationListResponse>('/notifications', { params });
  return data;
}

export async function readAllNotifications(): Promise<void> {
  await instance.patch('/notifications');
}

export async function deleteAllNotifications(): Promise<void> {
  await instance.delete('/notifications');
}

export async function patchNotification(notificationId: number, body: UpdateNotificationBody): Promise<Notification> {
  const { data } = await instance.patch<Notification>(`/notifications/${notificationId}`, body);
  return data;
}

export async function deleteNotification(notificationId: number): Promise<void> {
  await instance.delete(`/notifications/${notificationId}`);
}
