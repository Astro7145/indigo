jest.mock('@/src/api/client-fetcher');
import instance from '@/src/api/client-fetcher';
import { getGoals, getAllGoals, getGoal, createGoal, patchGoal, deleteGoal, goalKeys } from '@/src/api/goal';

const mocked = instance as jest.Mocked<typeof instance>;
beforeEach(() => {
  jest.resetAllMocks();
  mocked.get.mockResolvedValue({ data: { goals: [], nextCursor: null, totalCount: 0 } } as never);
  mocked.post.mockResolvedValue({ data: { id: 1 } } as never);
  mocked.patch.mockResolvedValue({ data: { id: 1 } } as never);
  mocked.delete.mockResolvedValue({ data: undefined } as never);
});

it('getGoals는 params와 함께 GET /goals를 호출한다', async () => {
  const r = await getGoals({ cursor: 2, limit: 5 });
  expect(mocked.get).toHaveBeenCalledWith('/goals', { params: { cursor: 2, limit: 5 } });
  expect(r).toEqual({ goals: [], nextCursor: null, totalCount: 0 });
});
it('getAllGoals는 nextCursor 끝까지 따라가 전체 goal을 합친다', async () => {
  mocked.get
    .mockResolvedValueOnce({ data: { goals: [{ id: 1 }], nextCursor: 2, totalCount: 2 } } as never)
    .mockResolvedValueOnce({ data: { goals: [{ id: 2 }], nextCursor: null, totalCount: 2 } } as never);
  const r = await getAllGoals(5);
  expect(mocked.get).toHaveBeenNthCalledWith(1, '/goals', { params: { cursor: undefined, limit: 5 } });
  expect(mocked.get).toHaveBeenNthCalledWith(2, '/goals', { params: { cursor: 2, limit: 5 } });
  expect(r.goals.map((g) => g.id)).toEqual([1, 2]);
  expect(r.nextCursor).toBeNull();
  expect(r.totalCount).toBe(2);
});
it('getGoal는 GET /goals/:id를 호출한다', async () => {
  await getGoal(7);
  expect(mocked.get).toHaveBeenCalledWith('/goals/7');
});
it('createGoal는 /goals로 POST한다', async () => {
  await createGoal({ title: 't' });
  expect(mocked.post).toHaveBeenCalledWith('/goals', { title: 't' });
});
it('patchGoal는 /goals/:id로 PATCH한다', async () => {
  await patchGoal(7, { title: 'u' });
  expect(mocked.patch).toHaveBeenCalledWith('/goals/7', { title: 'u' });
});
it('deleteGoal는 /goals/:id로 DELETE한다', async () => {
  await deleteGoal(7);
  expect(mocked.delete).toHaveBeenCalledWith('/goals/7');
});
it('goalKeys 팩토리는 안정적인 키를 생성한다', () => {
  expect(goalKeys.list({ limit: 5 })).toEqual(['goal', 'list', { limit: 5 }]);
  expect(goalKeys.detail(7)).toEqual(['goal', 'detail', 7]);
});
