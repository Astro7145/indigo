jest.mock('@/src/api/user', () => ({
  ...jest.requireActual('@/src/api/user'),
  checkNickname: jest.fn(),
  getMe: jest.fn(),
  patchMe: jest.fn(),
  deleteMe: jest.fn(),
  changePassword: jest.fn(),
}));
import * as userApi from '@/src/api/user';
import { waitFor } from '@testing-library/react';
import { renderHookWithClient } from '@/src/hooks/__tests__/test-utils';
import { useMe, useCheckNickname, useUpdateMe, useDeleteMe, useChangePassword } from '@/src/hooks/user';

const mocked = userApi as jest.Mocked<typeof userApi>;

beforeEach(() => {
  jest.resetAllMocks();
});

it('useMe는 프로필을 조회한다', async () => {
  mocked.getMe.mockResolvedValue({ id: 1, email: 'a' } as never);
  const { result } = renderHookWithClient(() => useMe());
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(mocked.getMe).toHaveBeenCalled();
  expect(result.current.data).toEqual({ id: 1, email: 'a' });
});

it('useCheckNickname은 name이 비어있으면 비활성화된다', () => {
  renderHookWithClient(() => useCheckNickname(''));
  expect(mocked.checkNickname).not.toHaveBeenCalled();
});

it('useCheckNickname은 name이 공백뿐이면 비활성화된다', () => {
  renderHookWithClient(() => useCheckNickname('   '));
  expect(mocked.checkNickname).not.toHaveBeenCalled();
});

it('useCheckNickname은 name이 주어지면 checkNickname을 호출한다', async () => {
  mocked.checkNickname.mockResolvedValue({ available: true } as never);
  const { result } = renderHookWithClient(() => useCheckNickname('foo'));
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(mocked.checkNickname).toHaveBeenCalledWith('foo');
});

it('useUpdateMe는 무효화 없이 me 캐시에 기록한다', async () => {
  mocked.patchMe.mockResolvedValue({ id: 1, name: 'n' } as never);
  const { result, client } = renderHookWithClient(() => useUpdateMe());
  const inv = jest.spyOn(client, 'invalidateQueries');
  const setData = jest.spyOn(client, 'setQueryData');
  await result.current.mutateAsync({ name: 'n' });
  expect(mocked.patchMe).toHaveBeenCalledWith({ name: 'n' });
  expect(setData).toHaveBeenCalledWith(userApi.userKeys.me(), {
    id: 1,
    name: 'n',
  });
  expect(inv).not.toHaveBeenCalled();
});

it('useDeleteMe는 성공 시 캐시를 비운다', async () => {
  mocked.deleteMe.mockResolvedValue(undefined as never);
  const { result, client } = renderHookWithClient(() => useDeleteMe());
  const clear = jest.spyOn(client, 'clear');
  await result.current.mutateAsync();
  expect(mocked.deleteMe).toHaveBeenCalled();
  expect(clear).toHaveBeenCalled();
});

it('useChangePassword는 changePassword를 호출하고 캐시를 건드리지 않는다', async () => {
  mocked.changePassword.mockResolvedValue({ message: 'ok' } as never);
  const { result, client } = renderHookWithClient(() => useChangePassword());
  const inv = jest.spyOn(client, 'invalidateQueries');
  const clear = jest.spyOn(client, 'clear');
  await result.current.mutateAsync({ currentPassword: 'a', newPassword: 'b' });
  expect(mocked.changePassword).toHaveBeenCalledWith({
    currentPassword: 'a',
    newPassword: 'b',
  });
  expect(inv).not.toHaveBeenCalled();
  expect(clear).not.toHaveBeenCalled();
});
