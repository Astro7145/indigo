jest.mock('@/src/api/client-fetcher');
jest.mock('axios', () => ({ __esModule: true, default: { get: jest.fn() } }));
import instance from '@/src/api/client-fetcher';
import axios from 'axios';
import { checkNickname, getMe, patchMe, deleteMe, changePassword, userKeys } from '@/src/api/user';

const mocked = instance as jest.Mocked<typeof instance>;
const mockedAxios = axios as jest.Mocked<typeof axios>;
beforeEach(() => {
  jest.resetAllMocks();
  process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL = 'https://api.test';
  process.env.NEXT_PUBLIC_BACKEND_TEAM_ID = 'indigo';
  mocked.get.mockResolvedValue({ data: {} } as never);
  mocked.patch.mockResolvedValue({ data: {} } as never);
  mocked.delete.mockResolvedValue({ data: undefined } as never);
  mockedAxios.get.mockResolvedValue({ data: {} } as never);
});

// check-nickname은 인가가 필요 없으므로 BFF(/api)를 거치지 않고 외부 백엔드로 직접 호출한다 (#128).
it('checkNickname은 BFF를 거치지 않고 외부 백엔드로 인증 없이 직접 GET한다', async () => {
  mockedAxios.get.mockResolvedValue({ data: { available: true } } as never);
  const r = await checkNickname('foo');
  expect(mockedAxios.get).toHaveBeenCalledWith('https://api.test/indigo/users/check-nickname', {
    params: { name: 'foo' },
  });
  expect(mocked.get).not.toHaveBeenCalled();
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
