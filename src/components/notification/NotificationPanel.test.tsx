// hooks 모듈 전체를 mock — 실제 QueryClient·API 호출 없이 컴포넌트만 격리해 테스트한다
jest.mock('@/src/hooks/notification', () => ({
  useInfiniteNotificationList: jest.fn(),
  useRefreshNotifications: jest.fn(() => jest.fn()),
  useReadAllNotifications: jest.fn(),
  useDeleteAllNotifications: jest.fn(),
  useUpdateNotification: jest.fn(),
}));

import { fireEvent, render, screen, within } from '@testing-library/react';

import {
  useInfiniteNotificationList,
  useRefreshNotifications,
  useReadAllNotifications,
  useDeleteAllNotifications,
  useUpdateNotification,
} from '@/src/hooks/notification';
import NotificationPanel from '@/src/components/notification/NotificationPanel';
import type { Notification } from '@/src/types/notification';

// ── 픽스처 ──────────────────────────────────────────────────────────────────

const UNREAD_NOTIFICATION: Notification = {
  id: 1,
  teamId: 'team',
  userId: 1,
  type: 'todo',
  message: '[실제 디자인 시스템 사례 조사]의 마감일이 하루 남았어요!',
  data: { goalTitle: null, todoTitle: '실제 디자인 시스템 사례 조사', userImage: null },
  isRead: false,
  resourceId: 1,
  createdAt: new Date(Date.now() - 2 * 60_000).toISOString(),
};

const READ_NOTIFICATION: Notification = {
  id: 2,
  teamId: 'team',
  userId: 2,
  type: 'comment',
  message: 'OOO님이 댓글을 남겼어요.',
  data: {
    postTitle: '실제 디자인 시스템 사례 조사',
    userImage: '',
    commentAuthor: 'OOO',
    commentContent: '"댓글 내용입니다"',
  },
  isRead: true,
  resourceId: 2,
  createdAt: new Date(Date.now() - 60 * 60_000).toISOString(),
};

const MOCK_NOTIFICATIONS = [UNREAD_NOTIFICATION, READ_NOTIFICATION];

// ── hook mock 헬퍼 ───────────────────────────────────────────────────────────

const mockFetchNextPage = jest.fn();
const mockReadAll = jest.fn();
const mockDeleteAll = jest.fn();
const mockUpdateNotification = jest.fn();
const mockRefresh = jest.fn();

function setHookMocks({
  notifications = MOCK_NOTIFICATIONS,
  hasNextPage = false,
  isFetchingNextPage = false,
  isPending = false,
  isDeleting = false,
}: {
  notifications?: Notification[];
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  isPending?: boolean;
  isDeleting?: boolean;
} = {}) {
  jest.mocked(useInfiniteNotificationList).mockReturnValue({
    data: {
      pages: [
        {
          notifications,
          nextCursor: hasNextPage ? 10 : null,
          totalCount: notifications.length,
        },
      ],
      pageParams: [undefined],
    },
    fetchNextPage: mockFetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } as unknown as ReturnType<typeof useInfiniteNotificationList>);

  jest.mocked(useReadAllNotifications).mockReturnValue({
    mutate: mockReadAll,
    isPending,
  } as unknown as ReturnType<typeof useReadAllNotifications>);

  jest.mocked(useUpdateNotification).mockReturnValue({
    mutate: mockUpdateNotification,
  } as unknown as ReturnType<typeof useUpdateNotification>);

  jest.mocked(useDeleteAllNotifications).mockReturnValue({
    mutate: mockDeleteAll,
    isPending: isDeleting,
  } as unknown as ReturnType<typeof useDeleteAllNotifications>);

  jest.mocked(useRefreshNotifications).mockReturnValue(mockRefresh);
}

beforeEach(() => {
  jest.resetAllMocks();
  setHookMocks();
});

// ── 렌더링 ──────────────────────────────────────────────────────────────────

it('"알림" 헤더가 표시된다', () => {
  render(<NotificationPanel />);
  expect(screen.getByRole('heading', { name: '알림' })).toBeInTheDocument();
});

it('"모두 읽기" 버튼이 표시된다', () => {
  render(<NotificationPanel />);
  expect(screen.getByRole('button', { name: '모든 알림을 읽음으로 표시' })).toBeInTheDocument();
});

it('알림이 있으면 목록이 렌더링된다', () => {
  render(<NotificationPanel />);
  const list = screen.getByRole('list', { name: '알림 목록' });
  // 읽지 않은 알림: aria-label에 접두어 포함
  expect(
    within(list).getByRole('button', {
      name: `읽지 않은 알림: ${UNREAD_NOTIFICATION.message}`,
    }),
  ).toBeInTheDocument();
  // 읽은 알림: aria-label이 message와 동일
  expect(within(list).getByRole('button', { name: READ_NOTIFICATION.message })).toBeInTheDocument();
});

it('알림이 없으면 "아직 알림이 없어요"를 표시한다', () => {
  setHookMocks({ notifications: [] });
  render(<NotificationPanel />);
  expect(screen.getByRole('status')).toHaveTextContent('아직 알림이 없어요');
});

it('알림이 없으면 알림 목록을 렌더링하지 않는다', () => {
  setHookMocks({ notifications: [] });
  render(<NotificationPanel />);
  expect(screen.queryByRole('list', { name: '알림 목록' })).not.toBeInTheDocument();
});

// ── "모두 읽기" 버튼 활성화·비활성화 ────────────────────────────────────────

it('읽지 않은 알림이 있으면 "모두 읽기" 버튼이 활성화된다', () => {
  render(<NotificationPanel />);
  expect(screen.getByRole('button', { name: '모든 알림을 읽음으로 표시' })).not.toBeDisabled();
});

it('모두 읽은 상태이면 "모두 읽기" 버튼이 비활성화된다', () => {
  setHookMocks({
    notifications: [{ ...UNREAD_NOTIFICATION, isRead: true }, READ_NOTIFICATION],
  });
  render(<NotificationPanel />);
  expect(screen.getByRole('button', { name: '모든 알림을 읽음으로 표시' })).toBeDisabled();
});

it('알림이 없으면 "모두 읽기" 버튼이 비활성화된다', () => {
  setHookMocks({ notifications: [] });
  render(<NotificationPanel />);
  expect(screen.getByRole('button', { name: '모든 알림을 읽음으로 표시' })).toBeDisabled();
});

it('읽음 처리 중(isPending)이면 "모두 읽기" 버튼이 비활성화된다', () => {
  setHookMocks({ isPending: true });
  render(<NotificationPanel />);
  expect(screen.getByRole('button', { name: '모든 알림을 읽음으로 표시' })).toBeDisabled();
});

// ── "모두 읽기" 클릭 ─────────────────────────────────────────────────────────

it('"모두 읽기" 클릭 시 readAll이 호출된다', () => {
  render(<NotificationPanel />);
  fireEvent.click(screen.getByRole('button', { name: '모든 알림을 읽음으로 표시' }));
  expect(mockReadAll).toHaveBeenCalledTimes(1);
});

// ── 새로고침 ─────────────────────────────────────────────────────────────────

it('새로고침 버튼 클릭 시 refresh가 호출된다', () => {
  render(<NotificationPanel />);
  fireEvent.click(screen.getByRole('button', { name: '알림 목록 새로고침' }));
  expect(mockRefresh).toHaveBeenCalledTimes(1);
});

// ── 모두 삭제 ─────────────────────────────────────────────────────────────────

it('"모두 삭제" 클릭 시 deleteAll이 호출된다', () => {
  render(<NotificationPanel />);
  fireEvent.click(screen.getByRole('button', { name: '모두 삭제' }));
  expect(mockDeleteAll).toHaveBeenCalledTimes(1);
});

it('알림이 없으면 "모두 삭제" 버튼이 비활성화된다', () => {
  setHookMocks({ notifications: [] });
  render(<NotificationPanel />);
  expect(screen.getByRole('button', { name: '모두 삭제' })).toBeDisabled();
});

it('삭제 처리 중(isDeleting)이면 "모두 삭제" 버튼이 비활성화된다', () => {
  setHookMocks({ isDeleting: true });
  render(<NotificationPanel />);
  expect(screen.getByRole('button', { name: '모두 삭제' })).toBeDisabled();
});

// ── 개별 알림 클릭 ───────────────────────────────────────────────────────────

it('읽지 않은 알림 클릭 시 updateNotification이 { isRead: true }로 호출된다', () => {
  render(<NotificationPanel />);
  const list = screen.getByRole('list', { name: '알림 목록' });
  fireEvent.click(
    within(list).getByRole('button', {
      name: `읽지 않은 알림: ${UNREAD_NOTIFICATION.message}`,
    }),
  );
  expect(mockUpdateNotification).toHaveBeenCalledTimes(1);
  expect(mockUpdateNotification).toHaveBeenCalledWith({
    notificationId: UNREAD_NOTIFICATION.id,
    body: { isRead: true },
  });
});

it('이미 읽은 알림 클릭 시 updateNotification이 호출되지 않는다', () => {
  render(<NotificationPanel />);
  const list = screen.getByRole('list', { name: '알림 목록' });
  fireEvent.click(within(list).getByRole('button', { name: READ_NOTIFICATION.message }));
  expect(mockUpdateNotification).not.toHaveBeenCalled();
});

// ── 무한 스크롤("더 보기") ────────────────────────────────────────────────────

it('hasNextPage가 true이면 "더 보기" 버튼이 표시된다', () => {
  setHookMocks({ hasNextPage: true });
  render(<NotificationPanel />);
  expect(screen.getByRole('button', { name: '이전 알림 더 불러오기' })).toBeInTheDocument();
});

it('hasNextPage가 false이면 "더 보기" 버튼이 없다', () => {
  render(<NotificationPanel />);
  expect(screen.queryByRole('button', { name: '이전 알림 더 불러오기' })).not.toBeInTheDocument();
});

it('"더 보기" 클릭 시 fetchNextPage가 호출된다', () => {
  setHookMocks({ hasNextPage: true });
  render(<NotificationPanel />);
  fireEvent.click(screen.getByRole('button', { name: '이전 알림 더 불러오기' }));
  expect(mockFetchNextPage).toHaveBeenCalledTimes(1);
});

it('isFetchingNextPage가 true이면 "불러오는 중…"을 표시한다', () => {
  setHookMocks({ hasNextPage: true, isFetchingNextPage: true });
  render(<NotificationPanel />);
  expect(screen.getByText('불러오는 중…')).toBeInTheDocument();
});

it('"더 보기" 클릭 후 새 데이터로 재렌더링 시 추가 알림이 표시되고 버튼이 사라진다', () => {
  const EXTRA_NOTIFICATION: Notification = {
    id: 3,
    teamId: 'team',
    userId: 3,
    type: 'todo',
    message: '[두 번째 페이지 알림] 마감일이 하루 남았어요!',
    data: { goalTitle: null, todoTitle: '두 번째 페이지 알림', userImage: null },
    isRead: false,
    resourceId: 3,
    createdAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
  };

  // 첫 번째 페이지 상태: 기본 2개 알림 + 다음 페이지 존재
  setHookMocks({ hasNextPage: true });
  const { rerender } = render(<NotificationPanel />);

  // "더 보기" 클릭 시 fetchNextPage가 호출된다
  fireEvent.click(screen.getByRole('button', { name: '이전 알림 더 불러오기' }));
  expect(mockFetchNextPage).toHaveBeenCalledTimes(1);

  // 두 번째 페이지 로드 완료: 3개 알림, 더 이상 다음 페이지 없음
  setHookMocks({
    notifications: [...MOCK_NOTIFICATIONS, EXTRA_NOTIFICATION],
    hasNextPage: false,
  });
  rerender(<NotificationPanel />);

  // 새로 추가된 알림이 목록에 표시된다
  expect(screen.getByText(EXTRA_NOTIFICATION.message)).toBeInTheDocument();

  // 마지막 페이지이므로 "더 보기" 버튼이 사라진다
  expect(screen.queryByRole('button', { name: '이전 알림 더 불러오기' })).not.toBeInTheDocument();
});
