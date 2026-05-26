import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { todoKeys } from '@/src/api/todo';
import { favoriteKeys, addTodoFavorite, removeTodoFavorite, getFavoriteTodos } from '@/src/api/favorite';
import type { FavoriteTodo, FavoriteTodoListResponse } from '@/src/types/favorite';
import type { CursorParams, ApiError } from '@/src/types/common';

export function useFavoriteTodoList(params: CursorParams = {}) {
  return useQuery<FavoriteTodoListResponse, ApiError>({
    queryKey: favoriteKeys.list(params),
    queryFn: () => getFavoriteTodos(params),
  });
}

export function useInfiniteFavoriteTodoList(params: Omit<CursorParams, 'cursor'> = {}) {
  return useInfiniteQuery<FavoriteTodoListResponse, ApiError>({
    queryKey: [...favoriteKeys.list(params), 'infinite'],
    queryFn: ({ pageParam }) => getFavoriteTodos({ ...params, cursor: pageParam as number | undefined }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}

export function useAddTodoFavorite() {
  const qc = useQueryClient();
  return useMutation<FavoriteTodo, ApiError, number>({
    mutationFn: (todoId) => addTodoFavorite(todoId),
    onSuccess: (_, todoId) => {
      qc.invalidateQueries({ queryKey: todoKeys.lists() });
      qc.invalidateQueries({ queryKey: favoriteKeys.all });
      qc.invalidateQueries({ queryKey: todoKeys.detail(todoId) });
    },
  });
}

export function useRemoveTodoFavorite() {
  const qc = useQueryClient();
  return useMutation<void, ApiError, number>({
    mutationFn: (todoId) => removeTodoFavorite(todoId),
    onSuccess: (_, todoId) => {
      qc.invalidateQueries({ queryKey: todoKeys.lists() });
      qc.invalidateQueries({ queryKey: favoriteKeys.all });
      qc.invalidateQueries({ queryKey: todoKeys.detail(todoId) });
    },
  });
}
