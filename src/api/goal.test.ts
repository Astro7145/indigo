jest.mock('@/src/api/axiosInstance')
import instance from '@/src/api/axiosInstance'
import { getGoals, getGoal, createGoal, patchGoal, deleteGoal, goalKeys } from '@/src/api/goal'

const mocked = instance as jest.Mocked<typeof instance>
beforeEach(() => {
  jest.resetAllMocks()
  mocked.get.mockResolvedValue({ data: { goals: [], nextCursor: null, totalCount: 0 } } as never)
  mocked.post.mockResolvedValue({ data: { id: 1 } } as never)
  mocked.patch.mockResolvedValue({ data: { id: 1 } } as never)
  mocked.delete.mockResolvedValue({ data: undefined } as never)
})

it('getGoals GET /goals with params', async () => {
  const r = await getGoals({ cursor: 2, limit: 5 })
  expect(mocked.get).toHaveBeenCalledWith('/goals', { params: { cursor: 2, limit: 5 } })
  expect(r).toEqual({ goals: [], nextCursor: null, totalCount: 0 })
})
it('getGoal GET /goals/:id', async () => {
  await getGoal(7)
  expect(mocked.get).toHaveBeenCalledWith('/goals/7')
})
it('createGoal POST /goals', async () => {
  await createGoal({ title: 't' })
  expect(mocked.post).toHaveBeenCalledWith('/goals', { title: 't' })
})
it('patchGoal PATCH /goals/:id', async () => {
  await patchGoal(7, { title: 'u' })
  expect(mocked.patch).toHaveBeenCalledWith('/goals/7', { title: 'u' })
})
it('deleteGoal DELETE /goals/:id', async () => {
  await deleteGoal(7)
  expect(mocked.delete).toHaveBeenCalledWith('/goals/7')
})
it('goalKeys factory produces stable keys', () => {
  expect(goalKeys.list({ limit: 5 })).toEqual(['goal', 'list', { limit: 5 }])
  expect(goalKeys.detail(7)).toEqual(['goal', 'detail', 7])
})
