import { useQuery, useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalKeys, getAllGoals, getGoal, createGoal, patchGoal, deleteGoal } from '@/src/api/goal';
import type { Goal, GoalDetail, GoalListResponse, CreateGoalBody, UpdateGoalBody } from '@/src/types/goal';
import type { CursorParams, ApiError } from '@/src/types/common';

/**
 * 전체 goal 목록을 커서 끝까지 한 번에 불러온다. 사이드바·ProgressCard·대시보드 목표 별 할일이 공유한다.
 * 결과가 항상 전체이므로 캐시 키는 파라미터와 무관하게 'all'로 고정한다. params.limit은 요청당 페이지 크기.
 */
export function useGoalList(params: Omit<CursorParams, 'cursor'> = {}) {
  return useQuery<GoalListResponse, ApiError>({
    queryKey: [...goalKeys.lists(), 'all'],
    queryFn: () => getAllGoals(params.limit),
  });
}

// Suspense 변형 — 전체 목표를 한 번에 받아 클라이언트 정렬/윈도잉하는 대시보드 섹션(GoalTodoSection)용.
// useGoalList(non-suspense)와 동일한 'all' 키를 공유한다(사이드바·ProgressCard와 캐시·prefetch 공유).
export function useAllGoalsSuspense() {
  return useSuspenseQuery<GoalListResponse, ApiError>({
    queryKey: [...goalKeys.lists(), 'all'],
    queryFn: () => getAllGoals(),
  });
}

export function useGoal(id: number) {
  return useQuery<GoalDetail, ApiError>({
    queryKey: goalKeys.detail(id),
    queryFn: () => getGoal(id),
  });
}

// Suspense 변형 — 경계가 로딩/에러를 처리하는 GoalDetail 상단 섹션에서 쓴다.
// ProgressCard·NotesCollection은 optional-chain으로 쓰므로 기존 useGoal을 유지한다.
export function useGoalSuspense(id: number) {
  return useSuspenseQuery<GoalDetail, ApiError>({
    queryKey: goalKeys.detail(id),
    queryFn: () => getGoal(id),
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
