export interface Goal {
  id: number;
  teamId: string;
  userId: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalListItem extends Goal {
  todoCount: number;
  completedCount: number;
}

export interface GoalDetailTodo {
  id: number;
  title: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GoalDetail extends Goal {
  todos: GoalDetailTodo[];
}

export interface GoalListResponse {
  goals: GoalListItem[];
  nextCursor: number | null;
  totalCount: number;
}

/** 목표 목록 클라이언트 정렬 기준(`/goals` API는 정렬 미지원). */
export type GoalSort = 'latest' | 'oldest' | 'progressHigh' | 'progressLow';

export interface CreateGoalBody {
  title: string;
}

export interface UpdateGoalBody {
  title?: string;
}
