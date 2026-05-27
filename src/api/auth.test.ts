jest.mock('@/src/api/axiosInstance');
import instance from '@/src/api/axiosInstance';
import { signup, login, refresh, logout, authKeys } from '@/src/api/auth';

const mocked = instance as jest.Mocked<typeof instance>;
beforeEach(() => {
  jest.resetAllMocks();
  mocked.post.mockResolvedValue({ data: { user: { id: 1, email: 'a@b.c', name: 'n', image: null } } } as never);
});

it('login은 /auth/login으로 POST하고 { user }를 반환한다', async () => {
  const r = await login({ email: 'a@b.c', password: 'pw' });
  expect(mocked.post).toHaveBeenCalledWith('/iauth/login', { email: 'a@b.c', password: 'pw' });
  expect(r).toEqual({ user: { id: 1, email: 'a@b.c', name: 'n', image: null } });
});
it('signup은 /auth/signup으로 POST하고 { user }를 반환한다', async () => {
  const r = await signup({ email: 'a@b.c', name: 'n', password: 'pw' });
  expect(mocked.post).toHaveBeenCalledWith('/iauth/signup', { email: 'a@b.c', name: 'n', password: 'pw' });
  expect(r).toEqual({ user: { id: 1, email: 'a@b.c', name: 'n', image: null } });
});
it('refresh는 body 없이 /auth/refresh로 POST하고 void를 반환한다', async () => {
  mocked.post.mockResolvedValue({ data: undefined } as never);
  const r = await refresh();
  expect(mocked.post).toHaveBeenCalledWith('/iauth/refresh');
  expect(r).toBeUndefined();
});
it('logout은 body 없이 /auth/logout으로 POST하고 void를 반환한다', async () => {
  mocked.post.mockResolvedValue({ data: undefined } as never);
  const r = await logout();
  expect(mocked.post).toHaveBeenCalledWith('/iauth/logout');
  expect(r).toBeUndefined();
});
it('authKeys.all은 안정적이다', () => {
  expect(authKeys.all).toEqual(['auth']);
});
