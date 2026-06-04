export interface Notification {
  id: number;
  teamId: string;
  userId: number;
  type: string;
  message: string;
  data?: unknown;
  isRead: boolean;
  resourceId: number | null;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  nextCursor: number | null;
  totalCount: number;
}

export interface UpdateNotificationBody {
  isRead: boolean;
}
