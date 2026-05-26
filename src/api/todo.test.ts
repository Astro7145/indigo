jest.mock('@/src/api/axiosInstance');
import instance from '@/src/api/axiosInstance';
import { getTodos, createTodo, patchTodo, deleteTodo, getTodo, todoKeys } from '@/src/api/todo';

const mocked = instance as jest.Mocked<typeof instance>;

beforeEach(() => {
  jest.resetAllMocks();
  mocked.get.mockResolvedValue({ data: { todos: [], nextCursor: null, totalCount: 0 } } as never);
  mocked.post.mockResolvedValue({ data: { id: 1 } } as never);
  mocked.patch.mockResolvedValue({ data: { id: 1 } } as never);
  mocked.delete.mockResolvedValue({ data: undefined } as never);
});

it('getTodos는 params와 함께 GET /todos를 호출하고 데이터를 반환한다', async () => {
  const r = await getTodos({ cursor: 10, limit: 20, done: 'true' });
  expect(mocked.get).toHaveBeenCalledWith('/todos', { params: { cursor: 10, limit: 20, done: 'true' } });
  expect(r).toEqual({ todos: [], nextCursor: null, totalCount: 0 });
});

it('createTodo는 body와 함께 /todos로 POST한다', async () => {
  await createTodo({ title: 'x' });
  expect(mocked.post).toHaveBeenCalledWith('/todos', { title: 'x' });
});

it('patchTodo는 /todos/:id로 PATCH한다', async () => {
  await patchTodo(5, { done: true });
  expect(mocked.patch).toHaveBeenCalledWith('/todos/5', { done: true });
});

it('deleteTodo는 /todos/:id로 DELETE한다', async () => {
  await deleteTodo(5);
  expect(mocked.delete).toHaveBeenCalledWith('/todos/5');
});

it('getTodo는 GET /todos/:id를 호출한다', async () => {
  await getTodo(5);
  expect(mocked.get).toHaveBeenCalledWith('/todos/5');
});

it('todoKeys 팩토리는 안정적인 키를 생성한다', () => {
  expect(todoKeys.list({ done: 'true' })).toEqual(['todo', 'list', { done: 'true' }]);
  expect(todoKeys.detail(5)).toEqual(['todo', 'detail', 5]);
});
