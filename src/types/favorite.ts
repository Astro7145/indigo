import type { TodoGoalRef } from '@/src/types/todo';

export interface FavoriteTodo {
  id: number;
  teamId: string;
  userId: number;
  todoId: number;
  createdAt: string;
  todo: {
    id: number;
    title: string;
    done: boolean;
    goal: TodoGoalRef | null;
    noteIds: number[];
  };
}

export interface FavoriteTodoListResponse {
  favorites: FavoriteTodo[];
  nextCursor: number | null;
  totalCount: number;
}
