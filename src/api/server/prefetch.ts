// SERVER-ONLY: 라우트별 RSC prefetch 함수. 이슈 #136.
// 쿼리 키는 반드시 기존 키 팩토리로 만든다 — 클라 훅과 키가 어긋나면 prefetch가 통째로 무효가 된다.
// prefetch 실패는 TanStack이 삼켜 dehydrate에서 빠지고, 해당 경계만 클라에서 재시도한다(SSR 무해).
import type { QueryClient } from '@tanstack/react-query';
import type { CalendarDate } from '@internationalized/date';

import { favoriteKeys } from '@/src/api/favorite';
import { goalKeys } from '@/src/api/goal';
import { noteKeys } from '@/src/api/note';
import { serverGet } from '@/src/api/server/server-get';
import { todoKeys } from '@/src/api/todo';
import { userKeys } from '@/src/api/user';
import type { GoalListResponse } from '@/src/types/goal';
import type { Todo, TodoListResponse } from '@/src/types/todo';
import { calendarGridRange } from '@/src/utils/date';

/** 무한쿼리 첫 페이지 공통 — 훅 키 규약([...list(params), 'infinite'])과 동일해야 한다. */
function prefetchInfinite(qc: QueryClient, key: readonly unknown[], path: string, params: Record<string, unknown>) {
  return qc.prefetchInfiniteQuery({
    queryKey: [...key, 'infinite'],
    queryFn: () => serverGet(path, params),
    initialPageParam: undefined as number | undefined,
  });
}

export const prefetchMe = (qc: QueryClient) =>
  qc.prefetchQuery({ queryKey: userKeys.me(), queryFn: () => serverGet('users/me') });

/** 대시보드 RecentTodos — useTodoList({sort:'latest',limit:4})와 동일 키. */
export const prefetchRecentTodos = (qc: QueryClient) =>
  qc.prefetchQuery({
    queryKey: todoKeys.list({ sort: 'latest', limit: 4 }),
    queryFn: () => serverGet('todos', { sort: 'latest', limit: 4 }),
  });

/** useGoalList(getAllGoals) — ProgressCard·favorites/캘린더 목표 필터가 공유하는 'all' 키. */
export const prefetchAllGoals = (qc: QueryClient) =>
  qc.prefetchQuery({
    queryKey: [...goalKeys.lists(), 'all'],
    queryFn: async (): Promise<GoalListResponse> => {
      const goals: GoalListResponse['goals'] = [];
      let cursor: number | undefined;
      let totalCount = 0;
      do {
        const page = await serverGet<GoalListResponse>('goals', { cursor, limit: 100 });
        goals.push(...page.goals);
        totalCount = page.totalCount;
        cursor = page.nextCursor ?? undefined;
      } while (cursor !== undefined);
      return { goals, nextCursor: null, totalCount };
    },
  });

/** 대시보드 GoalTodoSection — useInfiniteGoalListSuspense({limit})와 동일 키. */
export const prefetchInfiniteGoals = (qc: QueryClient, limit: number) =>
  prefetchInfinite(qc, goalKeys.list({ limit }), 'goals', { limit });

/** GoalTodoBoard — useTodoList({goalId, keyword: undefined})와 동일 키(undefined는 해시에서 탈락). */
export const prefetchGoalBoard = (qc: QueryClient, goalId: number) =>
  qc.prefetchQuery({ queryKey: todoKeys.list({ goalId }), queryFn: () => serverGet('todos', { goalId }) });

/** /todos ALL 탭·목표 상세 컬럼 — useInfiniteTodoList(params)와 동일 키. */
export const prefetchInfiniteTodos = (
  qc: QueryClient,
  params: { sort?: 'latest' | 'dueSoon'; limit?: number; done?: 'true' | 'false'; goalId?: number },
) => prefetchInfinite(qc, todoKeys.list(params), 'todos', params);

/** /favorites — useFavoriteTodoList({limit:100})와 동일 키(목록·카운트 공유). */
export const prefetchFavorites = (qc: QueryClient) =>
  qc.prefetchQuery({
    queryKey: favoriteKeys.list({ limit: 100 }),
    queryFn: () => serverGet('todos/favorites', { limit: 100 }),
  });

export const prefetchGoalDetail = (qc: QueryClient, goalId: number) =>
  qc.prefetchQuery({ queryKey: goalKeys.detail(goalId), queryFn: () => serverGet(`goals/${goalId}`) });

/** 노트 모아보기 — useInfiniteNoteList({goalId, search: undefined, sort:'latest'}) 초기 키. */
export const prefetchInfiniteNotes = (qc: QueryClient, goalId: number) =>
  prefetchInfinite(qc, noteKeys.list({ goalId, sort: 'latest' }), 'notes', { goalId, sort: 'latest' });

export const prefetchNote = (qc: QueryClient, noteId: number) =>
  qc.prefetchQuery({ queryKey: noteKeys.detail(noteId), queryFn: () => serverGet(`notes/${noteId}`) });

/** /calendar — useTodosInRange(calendarGridRange(month))와 동일 키·범위. 커서를 끝까지 합친다. */
export const prefetchCalendarMonth = (qc: QueryClient, month: CalendarDate) => {
  const { from, to } = calendarGridRange(month);
  return qc.prefetchQuery({
    queryKey: [...todoKeys.lists(), 'range', { from, to }],
    queryFn: async (): Promise<TodoListResponse> => {
      const todos: Todo[] = [];
      let cursor: number | undefined;
      let totalCount = 0;
      do {
        const page = await serverGet<TodoListResponse>('todos', { from, to, cursor, limit: 100 });
        todos.push(...page.todos);
        totalCount = page.totalCount;
        cursor = page.nextCursor ?? undefined;
      } while (cursor !== undefined);
      return { todos, nextCursor: null, totalCount };
    },
  });
};

/** 대시보드 전체 — 무한 목표 첫 페이지를 받은 뒤 그 목표들의 보드까지 병렬 prefetch. */
export async function prefetchDashboard(qc: QueryClient) {
  await Promise.all([prefetchRecentTodos(qc), prefetchAllGoals(qc), prefetchInfiniteGoals(qc, 2)]);
  const goals = qc.getQueryData<{ pages: GoalListResponse[] }>([...goalKeys.list({ limit: 2 }), 'infinite']);
  const first = goals?.pages?.[0]?.goals ?? [];
  await Promise.all(first.map((g) => prefetchGoalBoard(qc, g.id)));
}
