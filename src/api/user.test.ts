jest.mock('@/src/api/axiosInstance')
import instance from '@/src/api/axiosInstance'
import {
  checkNickname, getMe, patchMe, deleteMe, changePassword, userKeys,
} from '@/src/api/user'

const mocked = instance as jest.Mocked<typeof instance>
beforeEach(() => {
  jest.resetAllMocks()
  mocked.get.mockResolvedValue({ data: {} } as never)
  mocked.patch.mockResolvedValue({ data: {} } as never)
  mocked.delete.mockResolvedValue({ data: undefined } as never)
})

it('checkNickname GET /users/check-nickname with name', async () => {
  await checkNickname('foo')
  expect(mocked.get).toHaveBeenCalledWith('/users/check-nickname', { params: { name: 'foo' } })
})
it('getMe GET /users/me', async () => {
  await getMe()
  expect(mocked.get).toHaveBeenCalledWith('/users/me')
})
it('patchMe PATCH /users/me', async () => {
  await patchMe({ name: 'n' })
  expect(mocked.patch).toHaveBeenCalledWith('/users/me', { name: 'n' })
})
it('deleteMe DELETE /users/me', async () => {
  await deleteMe()
  expect(mocked.delete).toHaveBeenCalledWith('/users/me')
})
it('changePassword PATCH /users/me/password', async () => {
  await changePassword({ currentPassword: 'a', newPassword: 'b' })
  expect(mocked.patch).toHaveBeenCalledWith('/users/me/password', { currentPassword: 'a', newPassword: 'b' })
})
it('userKeys.me', () => {
  expect(userKeys.me()).toEqual(['user', 'me'])
})
