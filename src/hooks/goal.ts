import {
  useQuery,
  useInfiniteQuery,
  useSuspenseInfiniteQuery,
  useMutation,
  useQueryClient,
  skipToken,
} from '@tanstack/react-query';
import { goalKeys, getGoals, getAllGoals, getGoal, createGoal, patchGoal, deleteGoal } from '@/src/api/goal';
import type { Goal, GoalDetail, GoalListResponse, CreateGoalBody, UpdateGoalBody } from '@/src/types/goal';
import type { CursorParams, ApiError } from '@/src/types/common';

/**
 * 전체 goal 목록을 커서 끝까지 한 번에 불러온다(일부 페이지/무한스크롤이 필요하면 useInfiniteGoalList).
 * 결과가 항상 전체이므로 캐시 키는 파라미터와 무관하게 고정한다. params.limit은 요청당 페이지 크기.
 */
export function useGoalList(params: Omit<CursorParams, 'cursor'> = {}) {
  return useQuery<GoalListResponse, ApiError>({
    queryKey: [...goalKeys.lists(), 'all'],
    queryFn: () => getAllGoals(params.limit),
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

// Suspense 변형 — 경계가 초기 로딩/에러를 처리하는 컨텍스트(예: GoalTodoSection)에서 쓴다.
// 사이드바(GoalSidebarList)는 내부 open 상태·open-게이트 무한스크롤 때문에 비-suspense 버전을 유지한다.
export function useInfiniteGoalListSuspense(params: Omit<CursorParams, 'cursor'> = {}) {
  return useSuspenseInfiniteQuery<GoalListResponse, ApiError>({
    queryKey: [...goalKeys.list(params), 'infinite'],
    queryFn: ({ pageParam }) => getGoals({ ...params, cursor: pageParam as number | undefined }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}

export function useGoal(id: number) {
  return useQuery<GoalDetail, ApiError>({
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
