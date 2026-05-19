jest.mock('@/src/api/axiosInstance')
import instance from '@/src/api/axiosInstance'
import { getTodos, createTodo, patchTodo, deleteTodo, addTodoFavorite, getTodo, removeTodoFavorite, getFavoriteTodos, todoKeys } from '@/src/api/todo'

const mocked = instance as jest.Mocked<typeof instance>

beforeEach(() => {
  jest.resetAllMocks()
  mocked.get.mockResolvedValue({ data: { todos: [], nextCursor: null, totalCount: 0 } } as never)
  mocked.post.mockResolvedValue({ data: { id: 1 } } as never)
  mocked.patch.mockResolvedValue({ data: { id: 1 } } as never)
  mocked.delete.mockResolvedValue({ data: undefined } as never)
})

it('getTodos calls GET /todos with params and returns data', async () => {
  const r = await getTodos({ cursor: 10, limit: 20, done: 'true' })
  expect(mocked.get).toHaveBeenCalledWith('/todos', { params: { cursor: 10, limit: 20, done: 'true' } })
  expect(r).toEqual({ todos: [], nextCursor: null, totalCount: 0 })
})

it('createTodo POSTs /todos with body', async () => {
  await createTodo({ title: 'x' })
  expect(mocked.post).toHaveBeenCalledWith('/todos', { title: 'x' })
})

it('patchTodo PATCHes /todos/:id', async () => {
  await patchTodo(5, { done: true })
  expect(mocked.patch).toHaveBeenCalledWith('/todos/5', { done: true })
})

it('deleteTodo DELETEs /todos/:id', async () => {
  await deleteTodo(5)
  expect(mocked.delete).toHaveBeenCalledWith('/todos/5')
})

it('addTodoFavorite POSTs favorites subpath', async () => {
  await addTodoFavorite(5)
  expect(mocked.post).toHaveBeenCalledWith('/todos/5/favorites')
})

it('getTodo calls GET /todos/:id', async () => {
  await getTodo(5)
  expect(mocked.get).toHaveBeenCalledWith('/todos/5')
})

it('removeTodoFavorite DELETEs favorites subpath', async () => {
  await removeTodoFavorite(5)
  expect(mocked.delete).toHaveBeenCalledWith('/todos/5/favorites')
})

it('getFavoriteTodos GETs /todos/favorites with params', async () => {
  await getFavoriteTodos({ cursor: 3, limit: 15 })
  expect(mocked.get).toHaveBeenCalledWith('/todos/favorites', { params: { cursor: 3, limit: 15 } })
})

it('todoKeys factory produces stable keys', () => {
  expect(todoKeys.list({ done: 'true' })).toEqual(['todo', 'list', { done: 'true' }])
  expect(todoKeys.detail(5)).toEqual(['todo', 'detail', 5])
  expect(todoKeys.favorites({ limit: 10 })).toEqual(['todo', 'favorites', { limit: 10 }])
})
