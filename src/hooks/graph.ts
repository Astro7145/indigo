import { useSuspenseQuery } from '@tanstack/react-query';
import { getAllGoals, goalKeys } from '@/src/api/goal';
import { getAllTodos, todoKeys } from '@/src/api/todo';
import type { GoalListItem } from '@/src/types/goal';
import type { Todo } from '@/src/types/todo';

/**
 * 3D 그래프용 합성 훅 — 전체 목표 + 전체 할일을 각각 커서 끝까지 1스윕으로 불러온다.
 * 목표 캐시 키는 useGoalList와 동일(`[...goalKeys.lists(),'all']`)해 대시보드와 공유한다. 둘 다 suspense.
 */
export function useGraphData(): { goals: GoalListItem[]; todos: Todo[] } {
  const goalsQ = useSuspenseQuery({
    queryKey: [...goalKeys.lists(), 'all'],
    queryFn: () => getAllGoals(),
  });
  const todosQ = useSuspenseQuery({
    queryKey: [...todoKeys.lists(), 'all'],
    queryFn: () => getAllTodos({}),
  });
  return { goals: goalsQ.data.goals, todos: todosQ.data.todos };
}
