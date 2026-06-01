import instance from '@/src/api/client-fetcher';
import { todoKeys } from '@/src/api/todo';
import type { FavoriteTodo, FavoriteTodoListResponse } from '@/src/types/favorite';
import type { CursorParams } from '@/src/types/common';

// favorites 캐시는 todo 네임스페이스 하위에 둔다 (API 경로가 /todos/favorites이고
// FavoriteTodo가 todo의 title/done을 품어, todo 변경 시 함께 무효화돼야 하므로).
export const favoriteKeys = {
  all: [...todoKeys.all, 'favorites'] as const,
  list: (filters: CursorParams = {}) => [...favoriteKeys.all, filters] as const,
};

export async function addTodoFavorite(todoId: number): Promise<FavoriteTodo> {
  const { data } = await instance.post<FavoriteTodo>(`/todos/${todoId}/favorites`);
  return data;
}

export async function removeTodoFavorite(todoId: number): Promise<void> {
  await instance.delete(`/todos/${todoId}/favorites`);
}

export async function getFavoriteTodos(params: CursorParams = {}): Promise<FavoriteTodoListResponse> {
  const { data } = await instance.get<FavoriteTodoListResponse>('/todos/favorites', { params });
  return data;
}
