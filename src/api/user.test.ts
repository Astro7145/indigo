jest.mock('@/src/api/axiosInstance');
import instance from '@/src/api/axiosInstance';
import { checkNickname, getMe, patchMe, deleteMe, changePassword, userKeys } from '@/src/api/user';

const mocked = instance as jest.Mocked<typeof instance>;
beforeEach(() => {
  jest.resetAllMocks();
  mocked.get.mockResolvedValue({ data: {} } as never);
  mocked.patch.mockResolvedValue({ data: {} } as never);
  mocked.delete.mockResolvedValue({ data: undefined } as never);
});

it('checkNickname은 name과 함께 GET /users/check-nickname을 호출한다', async () => {
  mocked.get.mockResolvedValue({ data: { available: true } } as never);
  const r = await checkNickname('foo');
  expect(mocked.get).toHaveBeenCalledWith('/users/check-nickname', { params: { name: 'foo' } });
  expect(r).toEqual({ available: true });
});
it('getMe는 GET /users/me를 호출한다', async () => {
  await getMe();
  expect(mocked.get).toHaveBeenCalledWith('/users/me');
});
it('patchMe는 PATCH /users/me를 호출한다', async () => {
  await patchMe({ name: 'n' });
  expect(mocked.patch).toHaveBeenCalledWith('/users/me', { name: 'n' });
});
it('deleteMe는 DELETE /users/me를 호출한다', async () => {
  await deleteMe();
  expect(mocked.delete).toHaveBeenCalledWith('/users/me');
});
it('changePassword는 PATCH /users/me/password를 호출한다', async () => {
  await changePassword({ currentPassword: 'a', newPassword: 'b' });
  expect(mocked.patch).toHaveBeenCalledWith('/users/me/password', { currentPassword: 'a', newPassword: 'b' });
});
it('userKeys 팩토리는 안정적인 키를 생성한다', () => {
  expect(userKeys.me()).toEqual(['user', 'me']);
  expect(userKeys.nickname('foo')).toEqual(['user', 'nickname', 'foo']);
});
