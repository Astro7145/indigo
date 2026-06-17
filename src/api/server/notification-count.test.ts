// cache를 passthrough로 모킹해 요청 스코프 없이도 테스트가 독립적으로 동작하게 한다.
jest.mock('react', () => ({ ...jest.requireActual('react'), cache: <T>(fn: T) => fn }));
jest.mock('@/src/api/server/server-get', () => ({ serverGet: jest.fn() }));

import { serverGet } from '@/src/api/server/server-get';
import { getUnreadNotificationCount, notificationTitlePrefix } from '@/src/api/server/notification-count';

const mockedGet = serverGet as jest.Mock;

beforeEach(() => jest.resetAllMocks());

describe('notificationTitlePrefix', () => {
  it('0이면 빈 문자열을 반환한다', () => {
    expect(notificationTitlePrefix(0)).toBe('');
  });
  it('양수면 "(N) " 형태를 반환한다', () => {
    expect(notificationTitlePrefix(3)).toBe('(3) ');
  });
});

describe('getUnreadNotificationCount', () => {
  it('isRead=false인 알림만 센다', async () => {
    mockedGet.mockResolvedValue({
      notifications: [{ isRead: false }, { isRead: true }, { isRead: false }],
      nextCursor: null,
      totalCount: 3,
    });
    expect(await getUnreadNotificationCount()).toBe(2);
    expect(mockedGet).toHaveBeenCalledWith('notifications', { limit: 100 });
  });

  it('미인증·실패 시 0을 반환한다', async () => {
    mockedGet.mockRejectedValue(new Error('no access token'));
    expect(await getUnreadNotificationCount()).toBe(0);
  });
});
