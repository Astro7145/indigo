jest.mock('@/src/api/axiosInstance')
import instance from '@/src/api/axiosInstance'
import {
  getNotifications, readAllNotifications, deleteAllNotifications,
  patchNotification, deleteNotification, notificationKeys,
} from '@/src/api/notification'

const mocked = instance as jest.Mocked<typeof instance>
beforeEach(() => {
  jest.resetAllMocks()
  mocked.get.mockResolvedValue({ data: { notifications: [], nextCursor: null, totalCount: 0 } } as never)
  mocked.patch.mockResolvedValue({ data: {} } as never)
  mocked.delete.mockResolvedValue({ data: undefined } as never)
})

it('getNotifications GET /notifications', async () => {
  const r = await getNotifications({ limit: 10 })
  expect(mocked.get).toHaveBeenCalledWith('/notifications', { params: { limit: 10 } })
  expect(r).toEqual({ notifications: [], nextCursor: null, totalCount: 0 })
})
it('readAllNotifications PATCH /notifications', async () => {
  await readAllNotifications()
  expect(mocked.patch).toHaveBeenCalledWith('/notifications')
})
it('deleteAllNotifications DELETE /notifications', async () => {
  await deleteAllNotifications()
  expect(mocked.delete).toHaveBeenCalledWith('/notifications')
})
it('patchNotification PATCH /notifications/:id', async () => {
  await patchNotification(4, { isRead: true })
  expect(mocked.patch).toHaveBeenCalledWith('/notifications/4', { isRead: true })
})
it('deleteNotification DELETE /notifications/:id', async () => {
  await deleteNotification(4)
  expect(mocked.delete).toHaveBeenCalledWith('/notifications/4')
})
it('notificationKeys factory produces stable keys', () => {
  expect(notificationKeys.list({ limit: 10 })).toEqual(['notification', 'list', { limit: 10 }])
})
