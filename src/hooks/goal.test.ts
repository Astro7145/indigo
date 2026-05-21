jest.mock('@/src/api/goal', () => ({
  ...jest.requireActual('@/src/api/goal'),
  getGoals: jest.fn(),
  getGoal: jest.fn(),
  createGoal: jest.fn(),
  patchGoal: jest.fn(),
  deleteGoal: jest.fn(),
}))
import * as goalApi from '@/src/api/goal'
import { waitFor } from '@testing-library/react'
import { renderHookWithClient } from '@/src/hooks/__tests__/test-utils'
import {
  useGoalList,
  useInfiniteGoalList,
  useGoal,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
} from '@/src/hooks/goal'

const mocked = goalApi as jest.Mocked<typeof goalApi>

beforeEach(() => {
  jest.resetAllMocks()
})

it('useGoalList calls getGoals with params', async () => {
  mocked.getGoals.mockResolvedValue({
    goals: [],
    nextCursor: null,
    totalCount: 0,
  } as never)
  const { result } = renderHookWithClient(() => useGoalList({ limit: 10 }))
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(mocked.getGoals).toHaveBeenCalledWith({ limit: 10 })
})

it('useGoal is disabled when id is undefined', () => {
  renderHookWithClient(() => useGoal(undefined))
  expect(mocked.getGoal).not.toHaveBeenCalled()
})

it('useGoal calls getGoal when id is provided', async () => {
  mocked.getGoal.mockResolvedValue({ id: 5, title: 't', todos: [] } as never)
  const { result } = renderHookWithClient(() => useGoal(5))
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(mocked.getGoal).toHaveBeenCalledWith(5)
})

it('useInfiniteGoalList paginates with nextCursor', async () => {
  mocked.getGoals.mockResolvedValueOnce({
    goals: [],
    nextCursor: 9,
    totalCount: 0,
  } as never)
  const { result } = renderHookWithClient(() =>
    useInfiniteGoalList({ limit: 5 }),
  )
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(mocked.getGoals).toHaveBeenLastCalledWith({
    limit: 5,
    cursor: undefined,
  })
  expect(result.current.hasNextPage).toBe(true)
})

it('useCreateGoal invalidates lists on success', async () => {
  mocked.createGoal.mockResolvedValue({ id: 1, title: 'x' } as never)
  const { result, client } = renderHookWithClient(() => useCreateGoal())
  const inv = jest.spyOn(client, 'invalidateQueries')
  await result.current.mutateAsync({ title: 'x' })
  expect(mocked.createGoal).toHaveBeenCalledWith({ title: 'x' })
  expect(inv).toHaveBeenCalledWith({ queryKey: goalApi.goalKeys.lists() })
})

it('useUpdateGoal invalidates lists and detail on success', async () => {
  mocked.patchGoal.mockResolvedValue({ id: 5, title: 'x' } as never)
  const { result, client } = renderHookWithClient(() => useUpdateGoal())
  const inv = jest.spyOn(client, 'invalidateQueries')
  await result.current.mutateAsync({ goalId: 5, body: { title: 'x' } })
  expect(mocked.patchGoal).toHaveBeenCalledWith(5, { title: 'x' })
  expect(inv).toHaveBeenCalledWith({ queryKey: goalApi.goalKeys.lists() })
  expect(inv).toHaveBeenCalledWith({ queryKey: goalApi.goalKeys.detail(5) })
})

it('useDeleteGoal invalidates lists and removes detail on success', async () => {
  mocked.deleteGoal.mockResolvedValue(undefined as never)
  const { result, client } = renderHookWithClient(() => useDeleteGoal())
  const inv = jest.spyOn(client, 'invalidateQueries')
  const rm = jest.spyOn(client, 'removeQueries')
  await result.current.mutateAsync(5)
  expect(mocked.deleteGoal).toHaveBeenCalledWith(5)
  expect(inv).toHaveBeenCalledWith({ queryKey: goalApi.goalKeys.lists() })
  expect(rm).toHaveBeenCalledWith({ queryKey: goalApi.goalKeys.detail(5) })
})
