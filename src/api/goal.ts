import instance from '@/src/api/client-fetcher';
import type {
  Goal,
  GoalDetail,
  GoalListItem,
  GoalListResponse,
  CreateGoalBody,
  UpdateGoalBody,
} from '@/src/types/goal';
import type { CursorParams } from '@/src/types/common';

export const goalKeys = {
  all: ['goal'] as const,
  lists: () => [...goalKeys.all, 'list'] as const,
  list: (filters: CursorParams = {}) => [...goalKeys.lists(), filters] as const,
  details: () => [...goalKeys.all, 'detail'] as const,
  detail: (id: number) => [...goalKeys.details(), id] as const,
};

export async function getGoals(params: CursorParams = {}): Promise<GoalListResponse> {
  const { data } = await instance.get<GoalListResponse>('/goals', { params });
  return data;
}

// nextCursor를 따라 모든 페이지를 끝까지 불러와 전체 goal 목록을 합친다.
// (목록 일부/무한스크롤이 필요하면 getGoals·useInfiniteGoalList를 쓴다.) limit은 요청당 페이지 크기.
export async function getAllGoals(limit = 100): Promise<GoalListResponse> {
  const goals: GoalListItem[] = [];
  let cursor: number | undefined;
  let totalCount = 0;
  do {
    const page = await getGoals({ cursor, limit });
    goals.push(...page.goals);
    totalCount = page.totalCount;
    cursor = page.nextCursor ?? undefined;
  } while (cursor !== undefined);
  return { goals, nextCursor: null, totalCount };
}

export async function getGoal(goalId: number): Promise<GoalDetail> {
  const { data } = await instance.get<GoalDetail>(`/goals/${goalId}`);
  return data;
}

export async function createGoal(body: CreateGoalBody): Promise<Goal> {
  const { data } = await instance.post<Goal>('/goals', body);
  return data;
}

export async function patchGoal(goalId: number, body: UpdateGoalBody): Promise<Goal> {
  const { data } = await instance.patch<Goal>(`/goals/${goalId}`, body);
  return data;
}

export async function deleteGoal(goalId: number): Promise<void> {
  await instance.delete(`/goals/${goalId}`);
}
