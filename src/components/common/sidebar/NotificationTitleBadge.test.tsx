let mockPathname = '/calendar';
jest.mock('next/navigation', () => ({ usePathname: () => mockPathname }));
jest.mock('@/src/hooks/notification', () => ({ useInfiniteNotificationList: jest.fn() }));

import { render, waitFor, cleanup } from '@testing-library/react';

import { useInfiniteNotificationList } from '@/src/hooks/notification';
import NotificationTitleBadge, { applyUnreadPrefix } from '@/src/components/common/sidebar/NotificationTitleBadge';

const mockHook = useInfiniteNotificationList as jest.Mock;

const setNotifications = (unread: number, read = 0) => {
  const notifications = [
    ...Array.from({ length: unread }, () => ({ isRead: false })),
    ...Array.from({ length: read }, () => ({ isRead: true })),
  ];
  mockHook.mockReturnValue({ data: { pages: [{ notifications }] } });
};

beforeEach(() => {
  mockPathname = '/calendar';
  document.title = '캘린더 | INdigo';
});
afterEach(cleanup);

describe('applyUnreadPrefix', () => {
  it('count가 0이면 기존 "(N) " prefix를 제거한다', () => {
    expect(applyUnreadPrefix('(3) 대시보드 | INdigo', 0)).toBe('대시보드 | INdigo');
  });
  it('prefix 없는 타이틀에 count를 붙인다', () => {
    expect(applyUnreadPrefix('대시보드 | INdigo', 3)).toBe('(3) 대시보드 | INdigo');
  });
  it('이미 prefix가 있으면 중복 없이 새 count로 갱신한다', () => {
    expect(applyUnreadPrefix('(1) 게시물 | INdigo', 3)).toBe('(3) 게시물 | INdigo');
  });
  it('count가 0이고 prefix도 없으면 그대로 둔다', () => {
    expect(applyUnreadPrefix('로그인 | INdigo', 0)).toBe('로그인 | INdigo');
  });
});

describe('NotificationTitleBadge', () => {
  it('마운트 시 안 읽은 개수를 탭 타이틀 앞에 붙인다', async () => {
    setNotifications(3);
    render(<NotificationTitleBadge />);
    await waitFor(() => expect(document.title).toBe('(3) 캘린더 | INdigo'));
  });

  it('네비게이션으로 타이틀이 새로 덮어써져도 prefix를 재적용한다(MutationObserver)', async () => {
    setNotifications(3);
    render(<NotificationTitleBadge />);
    await waitFor(() => expect(document.title).toBe('(3) 캘린더 | INdigo'));

    // Next 메타데이터가 라우트 이동 시 base 타이틀로 덮어쓰는 상황을 모사
    document.title = '소통 게시판 | INdigo';
    await waitFor(() => expect(document.title).toBe('(3) 소통 게시판 | INdigo'));
  });

  it('안 읽은 알림이 없으면 prefix를 붙이지 않는다', async () => {
    setNotifications(0, 2);
    render(<NotificationTitleBadge />);
    await waitFor(() => expect(mockHook).toHaveBeenCalled());
    expect(document.title).toBe('캘린더 | INdigo');
  });
});
