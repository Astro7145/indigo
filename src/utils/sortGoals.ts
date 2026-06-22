import type { GoalListItem, GoalSort } from '@/src/types/goal';

/** 진행률(완료/전체). 전체가 0이면 0으로 취급한다(GoalTodoBoard의 percentOf와 동일 결). */
function progressOf(goal: GoalListItem): number {
  return goal.todoCount > 0 ? goal.completedCount / goal.todoCount : 0;
}

/**
 * 목표 목록을 정렬한 새 배열을 반환한다(입력 불변). `/goals` API가 정렬을 지원하지 않아
 * 전체 목표를 받아 클라이언트에서 정렬하는 용도. 진행률 동률은 최신순(createdAt desc)으로 안정화한다.
 */
export function sortGoals(goals: GoalListItem[], sort: GoalSort): GoalListItem[] {
  const byLatest = (a: GoalListItem, b: GoalListItem) => b.createdAt.localeCompare(a.createdAt);
  switch (sort) {
    case 'latest':
      return [...goals].sort(byLatest);
    case 'oldest':
      return [...goals].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    case 'progressHigh':
      return [...goals].sort((a, b) => progressOf(b) - progressOf(a) || byLatest(a, b));
    case 'progressLow':
      return [...goals].sort((a, b) => progressOf(a) - progressOf(b) || byLatest(a, b));
  }
}
