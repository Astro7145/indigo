interface NotificationBase {
  id: number;
  teamId: string;
  userId: number;
  message: string;
  isRead: boolean;
  resourceId: number | null;
  createdAt: string;
}

/** type 필드로 판별하는 알림 유니온. type별 data 구조가 다르다 (SSOT: Swagger GET /notifications). */
export type Notification = TodoNotification | GoalNotification | CommentNotification;

export interface NotificationListResponse {
  notifications: Notification[];
  nextCursor: number | null;
  totalCount: number;
}

export interface UpdateNotificationBody {
  isRead: boolean;
}

interface TodoNotificationData {
  goalTitle: string | null;
  todoTitle: string;
  userImage: string | null;
}

interface TodoNotification extends NotificationBase {
  type: 'todo';
  data: TodoNotificationData;
}

interface GoalNotificationData {
  goalTitle: string;
  userImage: string | null;
  totalTodos: number;
}

interface GoalNotification extends NotificationBase {
  type: 'goal';
  data: GoalNotificationData;
}

interface CommentNotificationData {
  postTitle: string;
  userImage: string | null;
  commentAuthor: string;
  commentContent: string;
}

interface CommentNotification extends NotificationBase {
  type: 'comment';
  data: CommentNotificationData;
}
