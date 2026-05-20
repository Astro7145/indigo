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
}))
import * as todoApi from '@/src/api/todo'
import { waitFor } from '@testing-library/react'
import { renderHookWithClient } from '@/src/hooks/__tests__/test-utils'
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
} from '@/src/hooks/todo'

const mocked = todoApi as jest.Mocked<typeof todoApi>

beforeEach(() => {
  jest.resetAllMocks()
})

it('useTodoList calls getTodos with params', async () => {
  mocked.getTodos.mockResolvedValue({
    todos: [],
    nextCursor: null,
    totalCount: 0,
  } as never)
  const { result } = renderHookWithClient(() => useTodoList({ done: 'true' }))
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(mocked.getTodos).toHaveBeenCalledWith({ done: 'true' })
})

it('useTodo is disabled when id is undefined', () => {
  renderHookWithClient(() => useTodo(undefined))
  expect(mocked.getTodo).not.toHaveBeenCalled()
})

it('useTodo calls getTodo when id is provided', async () => {
  mocked.getTodo.mockResolvedValue({ id: 5 } as never)
  const { result } = renderHookWithClient(() => useTodo(5))
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(mocked.getTodo).toHaveBeenCalledWith(5)
})

it('useInfiniteTodoList passes cursor on first page', async () => {
  mocked.getTodos.mockResolvedValueOnce({
    todos: [],
    nextCursor: 8,
    totalCount: 0,
  } as never)
  const { result } = renderHookWithClient(() =>
    useInfiniteTodoList({ limit: 5 }),
  )
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(mocked.getTodos).toHaveBeenLastCalledWith({
    limit: 5,
    cursor: undefined,
  })
  expect(result.current.hasNextPage).toBe(true)
})

it('useFavoriteTodoList calls getFavoriteTodos with params', async () => {
  mocked.getFavoriteTodos.mockResolvedValue({
    favorites: [],
    nextCursor: null,
    totalCount: 0,
  } as never)
  const { result } = renderHookWithClient(() =>
    useFavoriteTodoList({ limit: 10 }),
  )
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(mocked.getFavoriteTodos).toHaveBeenCalledWith({ limit: 10 })
})

it('useInfiniteFavoriteTodoList passes cursor on first page', async () => {
  mocked.getFavoriteTodos.mockResolvedValueOnce({
    favorites: [],
    nextCursor: 2,
    totalCount: 0,
  } as never)
  const { result } = renderHookWithClient(() =>
    useInfiniteFavoriteTodoList({ limit: 5 }),
  )
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(mocked.getFavoriteTodos).toHaveBeenLastCalledWith({
    limit: 5,
    cursor: undefined,
  })
})

it('useCreateTodo invalidates lists on success', async () => {
  mocked.createTodo.mockResolvedValue({ id: 1 } as never)
  const { result, client } = renderHookWithClient(() => useCreateTodo())
  const inv = jest.spyOn(client, 'invalidateQueries')
  await result.current.mutateAsync({ title: 'x' })
  expect(mocked.createTodo).toHaveBeenCalledWith({ title: 'x' })
  expect(inv).toHaveBeenCalledWith({ queryKey: todoApi.todoKeys.lists() })
})

it('useUpdateTodo invalidates lists and detail on success', async () => {
  mocked.patchTodo.mockResolvedValue({ id: 5 } as never)
  const { result, client } = renderHookWithClient(() => useUpdateTodo())
  const inv = jest.spyOn(client, 'invalidateQueries')
  await result.current.mutateAsync({ todoId: 5, body: { done: true } })
  expect(mocked.patchTodo).toHaveBeenCalledWith(5, { done: true })
  expect(inv).toHaveBeenCalledWith({ queryKey: todoApi.todoKeys.lists() })
  expect(inv).toHaveBeenCalledWith({ queryKey: todoApi.todoKeys.detail(5) })
})

it('useDeleteTodo invalidates lists and removes detail on success', async () => {
  mocked.deleteTodo.mockResolvedValue(undefined as never)
  const { result, client } = renderHookWithClient(() => useDeleteTodo())
  const inv = jest.spyOn(client, 'invalidateQueries')
  const rm = jest.spyOn(client, 'removeQueries')
  await result.current.mutateAsync(5)
  expect(mocked.deleteTodo).toHaveBeenCalledWith(5)
  expect(inv).toHaveBeenCalledWith({ queryKey: todoApi.todoKeys.lists() })
  expect(rm).toHaveBeenCalledWith({ queryKey: todoApi.todoKeys.detail(5) })
})

it('useAddTodoFavorite invalidates lists + favorites + detail on success', async () => {
  mocked.addTodoFavorite.mockResolvedValue({ id: 1, todoId: 5 } as never)
  const { result, client } = renderHookWithClient(() => useAddTodoFavorite())
  const inv = jest.spyOn(client, 'invalidateQueries')
  await result.current.mutateAsync(5)
  expect(mocked.addTodoFavorite).toHaveBeenCalledWith(5)
  expect(inv).toHaveBeenCalledWith({ queryKey: todoApi.todoKeys.lists() })
  expect(inv).toHaveBeenCalledWith({ queryKey: favoritesPrefix })
  expect(inv).toHaveBeenCalledWith({ queryKey: todoApi.todoKeys.detail(5) })
})

it('useRemoveTodoFavorite invalidates lists + favorites + detail on success', async () => {
  mocked.removeTodoFavorite.mockResolvedValue(undefined as never)
  const { result, client } = renderHookWithClient(() => useRemoveTodoFavorite())
  const inv = jest.spyOn(client, 'invalidateQueries')
  await result.current.mutateAsync(5)
  expect(mocked.removeTodoFavorite).toHaveBeenCalledWith(5)
  expect(inv).toHaveBeenCalledWith({ queryKey: todoApi.todoKeys.lists() })
  expect(inv).toHaveBeenCalledWith({ queryKey: favoritesPrefix })
  expect(inv).toHaveBeenCalledWith({ queryKey: todoApi.todoKeys.detail(5) })
})
