import instance from '@/src/api/axiosInstance'
import type {
  Goal,
  GoalDetail,
  GoalListResponse,
  CreateGoalBody,
  UpdateGoalBody,
} from '@/src/types/goal'
import type { CursorParams } from '@/src/types/common'

export const goalKeys = {
  all: ['goal'] as const,
  lists: () => [...goalKeys.all, 'list'] as const,
  list: (filters: CursorParams = {}) => [...goalKeys.lists(), filters] as const,
  details: () => [...goalKeys.all, 'detail'] as const,
  detail: (id: number) => [...goalKeys.details(), id] as const,
}

export async function getGoals(params: CursorParams = {}): Promise<GoalListResponse> {
  const { data } = await instance.get<GoalListResponse>('/goals', { params })
  return data
}

export async function getGoal(goalId: number): Promise<GoalDetail> {
  const { data } = await instance.get<GoalDetail>(`/goals/${goalId}`)
  return data
}

export async function createGoal(body: CreateGoalBody): Promise<Goal> {
  const { data } = await instance.post<Goal>('/goals', body)
  return data
}

export async function patchGoal(goalId: number, body: UpdateGoalBody): Promise<Goal> {
  const { data } = await instance.patch<Goal>(`/goals/${goalId}`, body)
  return data
}

export async function deleteGoal(goalId: number): Promise<void> {
  await instance.delete(`/goals/${goalId}`)
}
