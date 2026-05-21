jest.mock('@/src/api/todo', () => ({
  ...jest.requireActual('@/src/api/todo'),
  getTodos: jest.fn(),
  getTodo: jest.fn(),
  createTodo: jest.fn(),
  patchTodo: jest.fn(),
  deleteTodo: jest.fn(),
  addTodoFavorite: jest.fn(),
  removeTodoFavorite: jest.fn(),
  getFavoriteTodos: jest.fn(),
}));
import * as todoApi from '@/src/api/todo';
import { waitFor } from '@testing-library/react';
import { renderHookWithClient } from '@/src/hooks/__tests__/test-utils';
import {
  useTodoList,
  useInfiniteTodoList,
  useTodo,
  useFavoriteTodoList,
  useInfiniteFavoriteTodoList,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useAddTodoFavorite,
  useRemoveTodoFavorite,
  favoritesPrefix,
} from '@/src/hooks/todo';

const mocked = todoApi as jest.Mocked<typeof todoApi>;

beforeEach(() => {
  jest.resetAllMocks();
});

it('useTodoList는 params와 함께 getTodos를 호출한다', async () => {
  mocked.getTodos.mockResolvedValue({
    todos: [],
    nextCursor: null,
    totalCount: 0,
  } as never);
  const { result } = renderHookWithClient(() => useTodoList({ done: 'true' }));
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(mocked.getTodos).toHaveBeenCalledWith({ done: 'true' });
});

it('useTodo는 id가 undefined이면 비활성화된다', () => {
  renderHookWithClient(() => useTodo(undefined));
  expect(mocked.getTodo).not.toHaveBeenCalled();
});

it('useTodo는 id가 주어지면 getTodo를 호출한다', async () => {
  mocked.getTodo.mockResolvedValue({ id: 5 } as never);
  const { result } = renderHookWithClient(() => useTodo(5));
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(mocked.getTodo).toHaveBeenCalledWith(5);
});

it('useInfiniteTodoList는 첫 페이지에서 cursor를 전달한다', async () => {
  mocked.getTodos.mockResolvedValueOnce({
    todos: [],
    nextCursor: 8,
    totalCount: 0,
  } as never);
  const { result } = renderHookWithClient(() => useInfiniteTodoList({ limit: 5 }));
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(mocked.getTodos).toHaveBeenLastCalledWith({
    limit: 5,
    cursor: undefined,
  });
  expect(result.current.hasNextPage).toBe(true);
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

it('useCreateTodo는 성공 시 목록을 무효화한다', async () => {
  mocked.createTodo.mockResolvedValue({ id: 1 } as never);
  const { result, client } = renderHookWithClient(() => useCreateTodo());
  const inv = jest.spyOn(client, 'invalidateQueries');
  await result.current.mutateAsync({ title: 'x' });
  expect(mocked.createTodo).toHaveBeenCalledWith({ title: 'x' });
  expect(inv).toHaveBeenCalledWith({ queryKey: todoApi.todoKeys.lists() });
});

it('useUpdateTodo는 성공 시 목록과 즐겨찾기를 무효화하고 상세 캐시에 기록한다', async () => {
  mocked.patchTodo.mockResolvedValue({ id: 5 } as never);
  const { result, client } = renderHookWithClient(() => useUpdateTodo());
  const inv = jest.spyOn(client, 'invalidateQueries');
  const setData = jest.spyOn(client, 'setQueryData');
  await result.current.mutateAsync({ todoId: 5, body: { done: true } });
  expect(mocked.patchTodo).toHaveBeenCalledWith(5, { done: true });
  expect(inv).toHaveBeenCalledWith({ queryKey: todoApi.todoKeys.lists() });
  expect(inv).toHaveBeenCalledWith({ queryKey: favoritesPrefix });
  expect(setData).toHaveBeenCalledWith(todoApi.todoKeys.detail(5), { id: 5 });
});

it('useDeleteTodo는 성공 시 목록과 즐겨찾기를 무효화하고 상세 캐시를 제거한다', async () => {
  mocked.deleteTodo.mockResolvedValue(undefined as never);
  const { result, client } = renderHookWithClient(() => useDeleteTodo());
  const inv = jest.spyOn(client, 'invalidateQueries');
  const rm = jest.spyOn(client, 'removeQueries');
  await result.current.mutateAsync(5);
  expect(mocked.deleteTodo).toHaveBeenCalledWith(5);
  expect(inv).toHaveBeenCalledWith({ queryKey: todoApi.todoKeys.lists() });
  expect(rm).toHaveBeenCalledWith({ queryKey: todoApi.todoKeys.detail(5) });
  expect(inv).toHaveBeenCalledWith({ queryKey: favoritesPrefix });
});

it('useAddTodoFavorite는 성공 시 목록과 즐겨찾기와 상세를 무효화한다', async () => {
  mocked.addTodoFavorite.mockResolvedValue({ id: 1, todoId: 5 } as never);
  const { result, client } = renderHookWithClient(() => useAddTodoFavorite());
  const inv = jest.spyOn(client, 'invalidateQueries');
  await result.current.mutateAsync(5);
  expect(mocked.addTodoFavorite).toHaveBeenCalledWith(5);
  expect(inv).toHaveBeenCalledWith({ queryKey: todoApi.todoKeys.lists() });
  expect(inv).toHaveBeenCalledWith({ queryKey: favoritesPrefix });
  expect(inv).toHaveBeenCalledWith({ queryKey: todoApi.todoKeys.detail(5) });
});

it('useRemoveTodoFavorite는 성공 시 목록과 즐겨찾기와 상세를 무효화한다', async () => {
  mocked.removeTodoFavorite.mockResolvedValue(undefined as never);
  const { result, client } = renderHookWithClient(() => useRemoveTodoFavorite());
  const inv = jest.spyOn(client, 'invalidateQueries');
  await result.current.mutateAsync(5);
  expect(mocked.removeTodoFavorite).toHaveBeenCalledWith(5);
  expect(inv).toHaveBeenCalledWith({ queryKey: todoApi.todoKeys.lists() });
  expect(inv).toHaveBeenCalledWith({ queryKey: favoritesPrefix });
  expect(inv).toHaveBeenCalledWith({ queryKey: todoApi.todoKeys.detail(5) });
});
