const mockSearchParams = new URLSearchParams();
let mockPathname = '/';
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

jest.mock('@/src/api/user', () => ({
  ...jest.requireActual('@/src/api/user'),
  getMe: jest.fn(),
}));
jest.mock('@/src/api/todo', () => ({
  ...jest.requireActual('@/src/api/todo'),
  getTodos: jest.fn(),
}));
jest.mock('@/src/api/favorite', () => ({
  ...jest.requireActual('@/src/api/favorite'),
  getFavoriteTodos: jest.fn(),
}));

import { waitFor } from '@testing-library/react';

import * as favoriteApi from '@/src/api/favorite';
import * as todoApi from '@/src/api/todo';
import * as userApi from '@/src/api/user';
import { renderHookWithClient } from '@/src/hooks/__tests__/test-utils';
import { usePageTitle } from '@/src/hooks/usePageTitle';
import type { FavoriteTodo } from '@/src/types/favorite';

const todo = todoApi as jest.Mocked<typeof todoApi>;
const favorite = favoriteApi as jest.Mocked<typeof favoriteApi>;
const user = userApi as jest.Mocked<typeof userApi>;

const makeFav = (id: number, done: boolean): FavoriteTodo =>
  ({ id, todoId: id, todo: { id, done, goal: null } }) as never;

beforeEach(() => {
  jest.clearAllMocks();
  mockPathname = '/';
  mockSearchParams.delete('tab');
  user.getMe.mockResolvedValue({ name: '홍길동' } as never);
});

it('/todos에서 카운트는 현재 탭의 서버 카운트를 따른다 (?tab=todo → done:false)', async () => {
  mockPathname = '/todos';
  mockSearchParams.set('tab', 'todo');
  todo.getTodos.mockResolvedValue({ todos: [], totalCount: 7, nextCursor: null });
  const { result } = renderHookWithClient(() => usePageTitle());
  await waitFor(() => expect(result.current).toBe('모든 할일 7'));
  expect(todo.getTodos).toHaveBeenCalledWith(expect.objectContaining({ done: 'false' }));
});

it('/todos에서 탭이 없으면(ALL) done 파라미터 없이 전체 카운트를 쓴다', async () => {
  mockPathname = '/todos';
  todo.getTodos.mockResolvedValue({ todos: [], totalCount: 12, nextCursor: null });
  const { result } = renderHookWithClient(() => usePageTitle());
  await waitFor(() => expect(result.current).toBe('모든 할일 12'));
  expect(todo.getTodos.mock.calls[0][0]?.done).toBeUndefined();
});

it('/favorites에서 카운트는 탭으로 필터된 개수다 (?tab=done → 완료만)', async () => {
  mockPathname = '/favorites';
  mockSearchParams.set('tab', 'done');
  favorite.getFavoriteTodos.mockResolvedValue({
    favorites: [makeFav(1, true), makeFav(2, false), makeFav(3, true)],
    totalCount: 42,
    nextCursor: null,
  });
  const { result } = renderHookWithClient(() => usePageTitle());
  // totalCount(42)가 아니라 done 필터된 2 — 데스크탑 헤더와 동일 기준
  await waitFor(() => expect(result.current).toBe('찜한 할일 2'));
});

it('/favorites에서 탭이 없으면(ALL) 전체 찜 개수를 쓴다', async () => {
  mockPathname = '/favorites';
  favorite.getFavoriteTodos.mockResolvedValue({
    favorites: [makeFav(1, true), makeFav(2, false)],
    totalCount: 42,
    nextCursor: null,
  });
  const { result } = renderHookWithClient(() => usePageTitle());
  await waitFor(() => expect(result.current).toBe('찜한 할일 2'));
});
