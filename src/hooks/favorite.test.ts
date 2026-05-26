jest.mock('@/src/api/favorite', () => ({
  ...jest.requireActual('@/src/api/favorite'),
  addTodoFavorite: jest.fn(),
  removeTodoFavorite: jest.fn(),
  getFavoriteTodos: jest.fn(),
}));
import * as favoriteApi from '@/src/api/favorite';
import { todoKeys } from '@/src/api/todo';
import { waitFor } from '@testing-library/react';
import { renderHookWithClient } from '@/src/hooks/__tests__/test-utils';
import {
  useFavoriteTodoList,
  useInfiniteFavoriteTodoList,
  useAddTodoFavorite,
  useRemoveTodoFavorite,
} from '@/src/hooks/favorite';

const mocked = favoriteApi as jest.Mocked<typeof favoriteApi>;

beforeEach(() => {
  jest.resetAllMocks();
});

it('useFavoriteTodoList는 params와 함께 getFavoriteTodos를 호출한다', async () => {
  mocked.getFavoriteTodos.mockResolvedValue({
    favorites: [],
    nextCursor: null,
    totalCount: 0,
  } as never);
  const { result } = renderHookWithClient(() => useFavoriteTodoList({ limit: 10 }));
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(mocked.getFavoriteTodos).toHaveBeenCalledWith({ limit: 10 });
});

it('useInfiniteFavoriteTodoList는 첫 페이지에서 cursor를 전달한다', async () => {
  mocked.getFavoriteTodos.mockResolvedValueOnce({
    favorites: [],
    nextCursor: 2,
    totalCount: 0,
  } as never);
  const { result } = renderHookWithClient(() => useInfiniteFavoriteTodoList({ limit: 5 }));
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(mocked.getFavoriteTodos).toHaveBeenLastCalledWith({
    limit: 5,
    cursor: undefined,
  });
});

it('useAddTodoFavorite는 성공 시 목록과 즐겨찾기와 상세를 무효화한다', async () => {
  mocked.addTodoFavorite.mockResolvedValue({ id: 1, todoId: 5 } as never);
  const { result, client } = renderHookWithClient(() => useAddTodoFavorite());
  const inv = jest.spyOn(client, 'invalidateQueries');
  await result.current.mutateAsync(5);
  expect(mocked.addTodoFavorite).toHaveBeenCalledWith(5);
  expect(inv).toHaveBeenCalledWith({ queryKey: todoKeys.lists() });
  expect(inv).toHaveBeenCalledWith({ queryKey: favoriteApi.favoriteKeys.all });
  expect(inv).toHaveBeenCalledWith({ queryKey: todoKeys.detail(5) });
});

it('useRemoveTodoFavorite는 성공 시 목록과 즐겨찾기와 상세를 무효화한다', async () => {
  mocked.removeTodoFavorite.mockResolvedValue(undefined as never);
  const { result, client } = renderHookWithClient(() => useRemoveTodoFavorite());
  const inv = jest.spyOn(client, 'invalidateQueries');
  await result.current.mutateAsync(5);
  expect(mocked.removeTodoFavorite).toHaveBeenCalledWith(5);
  expect(inv).toHaveBeenCalledWith({ queryKey: todoKeys.lists() });
  expect(inv).toHaveBeenCalledWith({ queryKey: favoriteApi.favoriteKeys.all });
  expect(inv).toHaveBeenCalledWith({ queryKey: todoKeys.detail(5) });
});
