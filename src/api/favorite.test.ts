jest.mock('@/src/api/client-fetcher');
import instance from '@/src/api/client-fetcher';
import { addTodoFavorite, removeTodoFavorite, getFavoriteTodos, favoriteKeys } from '@/src/api/favorite';

const mocked = instance as jest.Mocked<typeof instance>;

beforeEach(() => {
  jest.resetAllMocks();
  mocked.get.mockResolvedValue({ data: { favorites: [], nextCursor: null, totalCount: 0 } } as never);
  mocked.post.mockResolvedValue({ data: { id: 1 } } as never);
  mocked.delete.mockResolvedValue({ data: undefined } as never);
});

it('addTodoFavorite는 favorites 하위 경로로 POST한다', async () => {
  await addTodoFavorite(5);
  expect(mocked.post).toHaveBeenCalledWith('/todos/5/favorites');
});

it('removeTodoFavorite는 favorites 하위 경로로 DELETE한다', async () => {
  await removeTodoFavorite(5);
  expect(mocked.delete).toHaveBeenCalledWith('/todos/5/favorites');
});

it('getFavoriteTodos는 params와 함께 /todos/favorites를 GET한다', async () => {
  await getFavoriteTodos({ cursor: 3, limit: 15 });
  expect(mocked.get).toHaveBeenCalledWith('/todos/favorites', { params: { cursor: 3, limit: 15 } });
});

it('favoriteKeys 팩토리는 안정적인 키를 생성한다', () => {
  expect(favoriteKeys.all).toEqual(['todo', 'favorites']);
  expect(favoriteKeys.list({ limit: 10 })).toEqual(['todo', 'favorites', { limit: 10 }]);
});
