import { useQuery, useInfiniteQuery, useMutation, useQueryClient, skipToken } from '@tanstack/react-query';
import { goalKeys, getGoals, getGoal, createGoal, patchGoal, deleteGoal } from '@/src/api/goal';
import type { Goal, GoalDetail, GoalListResponse, CreateGoalBody, UpdateGoalBody } from '@/src/types/goal';
import type { CursorParams, ApiError } from '@/src/types/common';

export function useGoalList(params: CursorParams = {}) {
  return useQuery<GoalListResponse, ApiError>({
    queryKey: goalKeys.list(params),
    queryFn: () => getGoals(params),
  });
}

export function useInfiniteGoalList(params: Omit<CursorParams, 'cursor'> = {}) {
  return useInfiniteQuery<GoalListResponse, ApiError>({
    queryKey: [...goalKeys.list(params), 'infinite'],
    queryFn: ({ pageParam }) => getGoals({ ...params, cursor: pageParam as number | undefined }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}

export function useGoal(id: number | undefined) {
  return useQuery<GoalDetail, ApiError>({
    queryKey: id == null ? [...goalKeys.details(), 'pending'] : goalKeys.detail(id),
    queryFn: id == null ? skipToken : () => getGoal(id),
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation<Goal, ApiError, CreateGoalBody>({
    mutationFn: (body) => createGoal(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation<Goal, ApiError, { goalId: number; body: UpdateGoalBody }>({
    mutationFn: ({ goalId, body }) => patchGoal(goalId, body),
    onSuccess: (_, { goalId }) => {
      qc.invalidateQueries({ queryKey: goalKeys.lists() });
      qc.invalidateQueries({ queryKey: goalKeys.detail(goalId) });
    },
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation<void, ApiError, number>({
    mutationFn: (id) => deleteGoal(id),
    onSuccess: (_, goalId) => {
      qc.invalidateQueries({ queryKey: goalKeys.lists() });
      qc.removeQueries({ queryKey: goalKeys.detail(goalId) });
    },
  });
}
