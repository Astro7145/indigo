jest.mock('@/src/api/goal', () => ({
  ...jest.requireActual('@/src/api/goal'),
  getGoals: jest.fn(),
  getGoal: jest.fn(),
  createGoal: jest.fn(),
  patchGoal: jest.fn(),
  deleteGoal: jest.fn(),
}));
import * as goalApi from '@/src/api/goal';
import { waitFor } from '@testing-library/react';
import { renderHookWithClient } from '@/src/hooks/__tests__/test-utils';
import {
  useGoalList,
  useInfiniteGoalList,
  useGoal,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
} from '@/src/hooks/goal';

const mocked = goalApi as jest.Mocked<typeof goalApi>;

beforeEach(() => {
  jest.resetAllMocks();
});

it('useGoalList는 params와 함께 getGoals를 호출한다', async () => {
  mocked.getGoals.mockResolvedValue({
    goals: [],
    nextCursor: null,
    totalCount: 0,
  } as never);
  const { result } = renderHookWithClient(() => useGoalList({ limit: 10 }));
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(mocked.getGoals).toHaveBeenCalledWith({ limit: 10 });
});

it('useGoal은 id가 undefined이면 비활성화된다', () => {
  renderHookWithClient(() => useGoal(undefined));
  expect(mocked.getGoal).not.toHaveBeenCalled();
});

it('useGoal은 id가 주어지면 getGoal을 호출한다', async () => {
  mocked.getGoal.mockResolvedValue({ id: 5, title: 't', todos: [] } as never);
  const { result } = renderHookWithClient(() => useGoal(5));
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(mocked.getGoal).toHaveBeenCalledWith(5);
});

it('useInfiniteGoalList는 nextCursor로 페이지네이션한다', async () => {
  mocked.getGoals.mockResolvedValueOnce({
    goals: [],
    nextCursor: 9,
    totalCount: 0,
  } as never);
  const { result } = renderHookWithClient(() => useInfiniteGoalList({ limit: 5 }));
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(mocked.getGoals).toHaveBeenLastCalledWith({
    limit: 5,
    cursor: undefined,
  });
  expect(result.current.hasNextPage).toBe(true);
});

it('useCreateGoal은 성공 시 목록을 무효화한다', async () => {
  mocked.createGoal.mockResolvedValue({ id: 1, title: 'x' } as never);
  const { result, client } = renderHookWithClient(() => useCreateGoal());
  const inv = jest.spyOn(client, 'invalidateQueries');
  await result.current.mutateAsync({ title: 'x' });
  expect(mocked.createGoal).toHaveBeenCalledWith({ title: 'x' });
  expect(inv).toHaveBeenCalledWith({ queryKey: goalApi.goalKeys.lists() });
});

it('useUpdateGoal은 성공 시 목록과 상세를 무효화한다', async () => {
  mocked.patchGoal.mockResolvedValue({ id: 5, title: 'x' } as never);
  const { result, client } = renderHookWithClient(() => useUpdateGoal());
  const inv = jest.spyOn(client, 'invalidateQueries');
  await result.current.mutateAsync({ goalId: 5, body: { title: 'x' } });
  expect(mocked.patchGoal).toHaveBeenCalledWith(5, { title: 'x' });
  expect(inv).toHaveBeenCalledWith({ queryKey: goalApi.goalKeys.lists() });
  expect(inv).toHaveBeenCalledWith({ queryKey: goalApi.goalKeys.detail(5) });
});

it('useDeleteGoal은 성공 시 목록을 무효화하고 상세 캐시를 제거한다', async () => {
  mocked.deleteGoal.mockResolvedValue(undefined as never);
  const { result, client } = renderHookWithClient(() => useDeleteGoal());
  const inv = jest.spyOn(client, 'invalidateQueries');
  const rm = jest.spyOn(client, 'removeQueries');
  await result.current.mutateAsync(5);
  expect(mocked.deleteGoal).toHaveBeenCalledWith(5);
  expect(inv).toHaveBeenCalledWith({ queryKey: goalApi.goalKeys.lists() });
  expect(rm).toHaveBeenCalledWith({ queryKey: goalApi.goalKeys.detail(5) });
});
