jest.mock('@/src/api/client-fetcher');
import instance from '@/src/api/client-fetcher';
import {
  getNotifications,
  readAllNotifications,
  deleteAllNotifications,
  patchNotification,
  deleteNotification,
  notificationKeys,
} from '@/src/api/notification';

const mocked = instance as jest.Mocked<typeof instance>;
beforeEach(() => {
  jest.resetAllMocks();
  mocked.get.mockResolvedValue({ data: { notifications: [], nextCursor: null, totalCount: 0 } } as never);
  mocked.patch.mockResolvedValue({ data: {} } as never);
  mocked.delete.mockResolvedValue({ data: undefined } as never);
});

it('getNotifications는 GET /notifications를 호출한다', async () => {
  const r = await getNotifications({ limit: 10 });
  expect(mocked.get).toHaveBeenCalledWith('/notifications', { params: { limit: 10 } });
  expect(r).toEqual({ notifications: [], nextCursor: null, totalCount: 0 });
});
it('readAllNotifications는 PATCH /notifications를 호출한다', async () => {
  await readAllNotifications();
  expect(mocked.patch).toHaveBeenCalledWith('/notifications');
});
it('deleteAllNotifications는 DELETE /notifications를 호출한다', async () => {
  await deleteAllNotifications();
  expect(mocked.delete).toHaveBeenCalledWith('/notifications');
});
it('patchNotification는 /notifications/:id로 PATCH한다', async () => {
  await patchNotification(4, { isRead: true });
  expect(mocked.patch).toHaveBeenCalledWith('/notifications/4', { isRead: true });
});
it('deleteNotification는 /notifications/:id로 DELETE한다', async () => {
  await deleteNotification(4);
  expect(mocked.delete).toHaveBeenCalledWith('/notifications/4');
});
it('notificationKeys 팩토리는 안정적인 키를 생성한다', () => {
  expect(notificationKeys.list({ limit: 10 })).toEqual(['notification', 'list', { limit: 10 }]);
});
