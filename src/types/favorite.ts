import type { Todo } from '@/src/types/todo';

export interface FavoriteTodo {
  id: number;
  teamId: string;
  userId: number;
  todoId: number;
  createdAt: string;
  todo: Todo;
}

export interface FavoriteTodoListResponse {
  favorites: FavoriteTodo[];
  nextCursor: number | null;
  totalCount: number;
}
