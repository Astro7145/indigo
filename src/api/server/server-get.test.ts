jest.mock('next/headers', () => ({ cookies: jest.fn() }));
jest.mock('@/src/api/server/server-fetcher', () => ({
  COOKIE: jest.requireActual('@/src/api/server/auth-cookies').COOKIE,
  callExternal: jest.fn(),
  refreshTokens: jest.fn(),
}));

import { cookies } from 'next/headers';

import { callExternal, refreshTokens } from '@/src/api/server/server-fetcher';
import { serverGet } from '@/src/api/server/server-get';

const mockedCookies = cookies as jest.Mock;
const mockedCall = callExternal as jest.Mock;
const mockedRefresh = refreshTokens as jest.Mock;

const jar = (map: Record<string, string>) => ({ get: (k: string) => (map[k] ? { value: map[k] } : undefined) });

beforeEach(() => jest.resetAllMocks());

it('access 토큰으로 GET을 호출하고 JSON을 반환한다', async () => {
  mockedCookies.mockResolvedValue(jar({ access_token: 'A' }));
  mockedCall.mockResolvedValue({ status: 200, body: '{"ok":1}', contentType: 'application/json' });
  const r = await serverGet<{ ok: number }>('todos', { limit: 4, sort: 'latest' });
  expect(mockedCall).toHaveBeenCalledWith({
    method: 'GET',
    path: 'todos',
    search: '?limit=4&sort=latest',
    accessToken: 'A',
  });
  expect(r).toEqual({ ok: 1 });
});

it('401이면 refresh 후 1회 재시도한다', async () => {
  mockedCookies.mockResolvedValue(jar({ access_token: 'old', refresh_token: 'R' }));
  mockedCall
    .mockResolvedValueOnce({ status: 401, body: '', contentType: null })
    .mockResolvedValueOnce({ status: 200, body: '{"ok":2}', contentType: 'application/json' });
  mockedRefresh.mockResolvedValue({ accessToken: 'new', refreshToken: null });
  const r = await serverGet('users/me');
  expect(mockedCall).toHaveBeenLastCalledWith(expect.objectContaining({ accessToken: 'new' }));
  expect(r).toEqual({ ok: 2 });
});

it('refresh 실패면 throw한다', async () => {
  mockedCookies.mockResolvedValue(jar({ access_token: 'old', refresh_token: 'R' }));
  mockedCall.mockResolvedValue({ status: 401, body: '', contentType: null });
  mockedRefresh.mockResolvedValue(null);
  await expect(serverGet('users/me')).rejects.toThrow();
});

it('토큰이 하나도 없으면 백엔드 호출 없이 throw한다', async () => {
  mockedCookies.mockResolvedValue(jar({}));
  await expect(serverGet('users/me')).rejects.toThrow();
  expect(mockedCall).not.toHaveBeenCalled();
});

it('undefined 파라미터는 쿼리에서 제외한다', async () => {
  mockedCookies.mockResolvedValue(jar({ access_token: 'A' }));
  mockedCall.mockResolvedValue({ status: 200, body: '{}', contentType: 'application/json' });
  await serverGet('todos', { goalId: 5, done: undefined });
  expect(mockedCall).toHaveBeenCalledWith(expect.objectContaining({ search: '?goalId=5' }));
});
