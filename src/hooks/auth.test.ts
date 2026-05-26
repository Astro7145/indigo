jest.mock('@/src/api/auth', () => ({
  ...jest.requireActual('@/src/api/auth'),
  signup: jest.fn(),
  login: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
  oauthLogin: jest.fn(),
}));
import * as authApi from '@/src/api/auth';
import { userKeys } from '@/src/api/user';
import { renderHookWithClient } from '@/src/hooks/__tests__/test-utils';
import { useSignup, useLogin, useOauthLogin, useLogout, useRefresh } from '@/src/hooks/auth';

const mocked = authApi as jest.Mocked<typeof authApi>;

beforeEach(() => {
  jest.resetAllMocks();
});

it('useSignup은 signup을 호출하고 userKeys.me를 무효화한다', async () => {
  mocked.signup.mockResolvedValue({
    user: { id: 1, email: 'a', name: 'n', image: null },
  } as never);
  const { result, client } = renderHookWithClient(() => useSignup());
  const inv = jest.spyOn(client, 'invalidateQueries');
  await result.current.mutateAsync({ email: 'a', name: 'n', password: 'p' });
  expect(mocked.signup).toHaveBeenCalledWith({
    email: 'a',
    name: 'n',
    password: 'p',
  });
  expect(inv).toHaveBeenCalledWith({ queryKey: userKeys.me() });
});

it('useLogin은 login을 호출하고 userKeys.me를 무효화한다', async () => {
  mocked.login.mockResolvedValue({ user: { id: 1 } } as never);
  const { result, client } = renderHookWithClient(() => useLogin());
  const inv = jest.spyOn(client, 'invalidateQueries');
  await result.current.mutateAsync({ email: 'a', password: 'p' });
  expect(mocked.login).toHaveBeenCalledWith({ email: 'a', password: 'p' });
  expect(inv).toHaveBeenCalledWith({ queryKey: userKeys.me() });
});

it('useOauthLogin은 provider와 body로 oauthLogin을 호출한다', async () => {
  mocked.oauthLogin.mockResolvedValue({ user: { id: 1 } } as never);
  const { result, client } = renderHookWithClient(() => useOauthLogin());
  const inv = jest.spyOn(client, 'invalidateQueries');
  await result.current.mutateAsync({ provider: 'google', body: { token: 't' } });
  expect(mocked.oauthLogin).toHaveBeenCalledWith('google', { token: 't' });
  expect(inv).toHaveBeenCalledWith({ queryKey: userKeys.me() });
});

it('useLogout은 logout을 호출하고 쿼리 캐시를 비운다', async () => {
  mocked.logout.mockResolvedValue(undefined as never);
  const { result, client } = renderHookWithClient(() => useLogout());
  const clear = jest.spyOn(client, 'clear');
  await result.current.mutateAsync();
  expect(mocked.logout).toHaveBeenCalled();
  expect(clear).toHaveBeenCalled();
});

it('useRefresh는 refresh를 호출하고 캐시를 건드리지 않는다', async () => {
  mocked.refresh.mockResolvedValue(undefined as never);
  const { result, client } = renderHookWithClient(() => useRefresh());
  const inv = jest.spyOn(client, 'invalidateQueries');
  const clear = jest.spyOn(client, 'clear');
  await result.current.mutateAsync();
  expect(mocked.refresh).toHaveBeenCalled();
  expect(inv).not.toHaveBeenCalled();
  expect(clear).not.toHaveBeenCalled();
});
