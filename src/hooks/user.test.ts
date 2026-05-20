jest.mock('@/src/api/user', () => ({
  ...jest.requireActual('@/src/api/user'),
  checkNickname: jest.fn(),
  getMe: jest.fn(),
  patchMe: jest.fn(),
  deleteMe: jest.fn(),
  changePassword: jest.fn(),
}))
import * as userApi from '@/src/api/user'
import { waitFor } from '@testing-library/react'
import { renderHookWithClient } from '@/src/hooks/__tests__/test-utils'
import {
  useMe,
  useCheckNickname,
  useUpdateMe,
  useDeleteMe,
  useChangePassword,
} from '@/src/hooks/user'

const mocked = userApi as jest.Mocked<typeof userApi>

beforeEach(() => {
  jest.resetAllMocks()
})

it('useMe fetches profile', async () => {
  mocked.getMe.mockResolvedValue({ id: 1, email: 'a' } as never)
  const { result } = renderHookWithClient(() => useMe())
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(mocked.getMe).toHaveBeenCalled()
  expect(result.current.data).toEqual({ id: 1, email: 'a' })
})

it('useCheckNickname is disabled when name is empty', () => {
  renderHookWithClient(() => useCheckNickname(''))
  expect(mocked.checkNickname).not.toHaveBeenCalled()
})

it('useCheckNickname is disabled when name is whitespace-only', () => {
  renderHookWithClient(() => useCheckNickname('   '))
  expect(mocked.checkNickname).not.toHaveBeenCalled()
})

it('useCheckNickname calls checkNickname when name is provided', async () => {
  mocked.checkNickname.mockResolvedValue({ available: true } as never)
  const { result } = renderHookWithClient(() => useCheckNickname('foo'))
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(mocked.checkNickname).toHaveBeenCalledWith('foo')
})

it('useUpdateMe writes me cache without invalidating', async () => {
  mocked.patchMe.mockResolvedValue({ id: 1, name: 'n' } as never)
  const { result, client } = renderHookWithClient(() => useUpdateMe())
  const inv = jest.spyOn(client, 'invalidateQueries')
  const setData = jest.spyOn(client, 'setQueryData')
  await result.current.mutateAsync({ name: 'n' })
  expect(mocked.patchMe).toHaveBeenCalledWith({ name: 'n' })
  expect(setData).toHaveBeenCalledWith(userApi.userKeys.me(), {
    id: 1,
    name: 'n',
  })
  expect(inv).not.toHaveBeenCalled()
})

it('useDeleteMe clears the cache on success', async () => {
  mocked.deleteMe.mockResolvedValue(undefined as never)
  const { result, client } = renderHookWithClient(() => useDeleteMe())
  const clear = jest.spyOn(client, 'clear')
  await result.current.mutateAsync()
  expect(mocked.deleteMe).toHaveBeenCalled()
  expect(clear).toHaveBeenCalled()
})

it('useChangePassword calls changePassword and does not touch cache', async () => {
  mocked.changePassword.mockResolvedValue({ message: 'ok' } as never)
  const { result, client } = renderHookWithClient(() => useChangePassword())
  const inv = jest.spyOn(client, 'invalidateQueries')
  const clear = jest.spyOn(client, 'clear')
  await result.current.mutateAsync({ currentPassword: 'a', newPassword: 'b' })
  expect(mocked.changePassword).toHaveBeenCalledWith({
    currentPassword: 'a',
    newPassword: 'b',
  })
  expect(inv).not.toHaveBeenCalled()
  expect(clear).not.toHaveBeenCalled()
})
