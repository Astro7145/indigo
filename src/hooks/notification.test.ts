jest.mock('@/src/api/notification', () => ({
  ...jest.requireActual('@/src/api/notification'),
  getNotifications: jest.fn(),
  readAllNotifications: jest.fn(),
  deleteAllNotifications: jest.fn(),
  patchNotification: jest.fn(),
  deleteNotification: jest.fn(),
}))
import * as notiApi from '@/src/api/notification'
import { waitFor, act } from '@testing-library/react'
import { renderHookWithClient } from '@/src/hooks/__tests__/test-utils'
import {
  useNotificationList,
  useInfiniteNotificationList,
  useReadAllNotifications,
  useDeleteAllNotifications,
  useUpdateNotification,
  useDeleteNotification,
} from '@/src/hooks/notification'

const mocked = notiApi as jest.Mocked<typeof notiApi>

beforeEach(() => {
  jest.resetAllMocks()
})

it('useNotificationList는 params와 함께 getNotifications를 호출한다', async () => {
  mocked.getNotifications.mockResolvedValue({
    notifications: [],
    nextCursor: null,
    totalCount: 0,
  } as never)
  const { result } = renderHookWithClient(() =>
    useNotificationList({ limit: 10 }),
  )
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(mocked.getNotifications).toHaveBeenCalledWith({ limit: 10 })
})

it('useInfiniteNotificationList는 nextCursor로 페이지네이션한다', async () => {
  mocked.getNotifications
    .mockResolvedValueOnce({
      notifications: [],
      nextCursor: 7,
      totalCount: 0,
    } as never)
    .mockResolvedValueOnce({
      notifications: [],
      nextCursor: null,
      totalCount: 0,
    } as never)
  const { result } = renderHookWithClient(() =>
    useInfiniteNotificationList({ limit: 10 }),
  )
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(mocked.getNotifications).toHaveBeenLastCalledWith({
    limit: 10,
    cursor: undefined,
  })
  expect(result.current.hasNextPage).toBe(true)
  await act(async () => {
    await result.current.fetchNextPage()
  })
  await waitFor(() => expect(result.current.data?.pages.length).toBe(2))
  expect(mocked.getNotifications).toHaveBeenLastCalledWith({
    limit: 10,
    cursor: 7,
  })
  expect(result.current.hasNextPage).toBe(false)
})

it('useReadAllNotifications는 목록을 무효화한다', async () => {
  mocked.readAllNotifications.mockResolvedValue(undefined as never)
  const { result, client } = renderHookWithClient(() =>
    useReadAllNotifications(),
  )
  const inv = jest.spyOn(client, 'invalidateQueries')
  await result.current.mutateAsync()
  expect(mocked.readAllNotifications).toHaveBeenCalled()
  expect(inv).toHaveBeenCalledWith({
    queryKey: notiApi.notificationKeys.lists(),
  })
})

it('useDeleteAllNotifications는 목록을 무효화한다', async () => {
  mocked.deleteAllNotifications.mockResolvedValue(undefined as never)
  const { result, client } = renderHookWithClient(() =>
    useDeleteAllNotifications(),
  )
  const inv = jest.spyOn(client, 'invalidateQueries')
  await result.current.mutateAsync()
  expect(inv).toHaveBeenCalledWith({
    queryKey: notiApi.notificationKeys.lists(),
  })
})

it('useUpdateNotification은 id와 body로 patchNotification을 호출한다', async () => {
  mocked.patchNotification.mockResolvedValue({ id: 5, isRead: true } as never)
  const { result, client } = renderHookWithClient(() => useUpdateNotification())
  const inv = jest.spyOn(client, 'invalidateQueries')
  await result.current.mutateAsync({
    notificationId: 5,
    body: { isRead: true },
  })
  expect(mocked.patchNotification).toHaveBeenCalledWith(5, { isRead: true })
  expect(inv).toHaveBeenCalledWith({
    queryKey: notiApi.notificationKeys.lists(),
  })
})

it('useDeleteNotification은 id로 deleteNotification을 호출한다', async () => {
  mocked.deleteNotification.mockResolvedValue(undefined as never)
  const { result, client } = renderHookWithClient(() => useDeleteNotification())
  const inv = jest.spyOn(client, 'invalidateQueries')
  await result.current.mutateAsync(5)
  expect(mocked.deleteNotification).toHaveBeenCalledWith(5)
  expect(inv).toHaveBeenCalledWith({
    queryKey: notiApi.notificationKeys.lists(),
  })
})
