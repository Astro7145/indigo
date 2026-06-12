import {
  useQuery,
  useSuspenseQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { todoKeys } from '@/src/api/todo';
import { patchTodoInCaches } from '@/src/hooks/todo';
import { favoriteKeys, addTodoFavorite, removeTodoFavorite, getFavoriteTodos } from '@/src/api/favorite';
import { filterFavorites, type FavoritesTab } from '@/src/components/favorite/favoritesTab';
import type { FavoriteTodo, FavoriteTodoListResponse } from '@/src/types/favorite';
import type { CursorParams, ApiError } from '@/src/types/common';

export function useFavoriteTodoList(params: CursorParams = {}) {
  return useSuspenseQuery<FavoriteTodoListResponse, ApiError>({
    queryKey: favoriteKeys.list(params),
    queryFn: () => getFavoriteTodos(params),
  });
}

/**
 * GNB 타이틀 등 비-suspense·조건부 맥락에서 개수만 조회한다(해당 route 진입 시에만 fetch).
 * FavoritesView의 목록 쿼리({limit:100})와 키를 공유해 추가 요청 없이 같은 데이터를 보고,
 * 데스크탑 헤더와 동일하게 탭으로 필터한 개수를 센다.
 */
export function useFavoriteCount(enabled: boolean, tab: FavoritesTab = 'all') {
  return useQuery<FavoriteTodoListResponse, ApiError, number>({
    queryKey: favoriteKeys.list({ limit: 100 }),
    queryFn: () => getFavoriteTodos({ limit: 100 }),
    enabled,
    select: (data) => filterFavorites(data.favorites, tab, null).length,
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
  return useMutation<FavoriteTodo, ApiError, number, { prev: [QueryKey, unknown][] }>({
    mutationFn: (todoId) => addTodoFavorite(todoId),
    // 낙관적: 별을 즉시 채움. 실패 시 onError에서 롤백.
    onMutate: async (todoId) => {
      await qc.cancelQueries({ queryKey: todoKeys.lists() });
      const prev = qc.getQueriesData({ queryKey: todoKeys.lists() });
      patchTodoInCaches(qc, todoId, { isFavorite: true });
      return { prev };
    },
    onError: (_err, _todoId, ctx) => {
      ctx?.prev.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: (_data, _err, todoId) => {
      qc.invalidateQueries({ queryKey: todoKeys.lists() });
      qc.invalidateQueries({ queryKey: favoriteKeys.all });
      qc.invalidateQueries({ queryKey: todoKeys.detail(todoId) });
    },
  });
}

export function useRemoveTodoFavorite() {
  const qc = useQueryClient();
  return useMutation<void, ApiError, number, { prev: [QueryKey, unknown][] }>({
    mutationFn: (todoId) => removeTodoFavorite(todoId),
    // 낙관적: 별을 즉시 비움. 실패 시 onError에서 롤백.
    onMutate: async (todoId) => {
      await qc.cancelQueries({ queryKey: todoKeys.lists() });
      const prev = qc.getQueriesData({ queryKey: todoKeys.lists() });
      patchTodoInCaches(qc, todoId, { isFavorite: false });
      return { prev };
    },
    onError: (_err, _todoId, ctx) => {
      ctx?.prev.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: (_data, _err, todoId) => {
      qc.invalidateQueries({ queryKey: todoKeys.lists() });
      qc.invalidateQueries({ queryKey: favoriteKeys.all });
      qc.invalidateQueries({ queryKey: todoKeys.detail(todoId) });
    },
  });
}
