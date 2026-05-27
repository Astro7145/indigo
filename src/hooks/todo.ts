import { useQuery, useInfiniteQuery, useMutation, useQueryClient, skipToken } from '@tanstack/react-query';
import { todoKeys, getTodos, getTodo, createTodo, patchTodo, deleteTodo } from '@/src/api/todo';
import { favoriteKeys } from '@/src/api/favorite';
import { goalKeys } from '@/src/api/goal';
import type { Todo, TodoListParams, TodoListResponse, CreateTodoBody, UpdateTodoBody } from '@/src/types/todo';
import type { ApiError } from '@/src/types/common';

export function useTodoList(params: TodoListParams = {}) {
  return useQuery<TodoListResponse, ApiError>({
    queryKey: todoKeys.list(params),
    queryFn: () => getTodos(params),
  });
}

export function useInfiniteTodoList(params: Omit<TodoListParams, 'cursor'> = {}) {
  return useInfiniteQuery<TodoListResponse, ApiError>({
    queryKey: [...todoKeys.list(params), 'infinite'],
    queryFn: ({ pageParam }) => getTodos({ ...params, cursor: pageParam as number | undefined }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}

export function useTodo(id: number | undefined) {
  return useQuery<Todo, ApiError>({
    queryKey: id == null ? [...todoKeys.details(), 'pending'] : todoKeys.detail(id),
    queryFn: id == null ? skipToken : () => getTodo(id),
  });
}

export function useCreateTodo() {
  const qc = useQueryClient();
  return useMutation<Todo, ApiError, CreateTodoBody>({
    mutationFn: (body) => createTodo(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
}

export function useUpdateTodo() {
  const qc = useQueryClient();
  return useMutation<Todo, ApiError, { todoId: number; body: UpdateTodoBody }>({
    mutationFn: ({ todoId, body }) => patchTodo(todoId, body),
    onSuccess: (data, { todoId }) => {
      qc.invalidateQueries({ queryKey: todoKeys.lists() });
      // PATCH 응답 shape가 GET 응답과 동일하므로 detail 캐시 직접 갱신.
      qc.setQueryData(todoKeys.detail(todoId), data);
      // FavoriteTodo.todo가 title/done을 품으므로 favorites 변형도 동기화.
      qc.invalidateQueries({ queryKey: favoriteKeys.all });
      // 대시보드 목표 카드의 진척도(completedCount/todoCount)를 최신 상태로 유지.
      qc.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
}

export function useDeleteTodo() {
  const qc = useQueryClient();
  return useMutation<void, ApiError, number>({
    mutationFn: (id) => deleteTodo(id),
    onSuccess: (_, todoId) => {
      qc.invalidateQueries({ queryKey: todoKeys.lists() });
      qc.removeQueries({ queryKey: todoKeys.detail(todoId) });
      // 삭제된 todo가 favorites 목록에 남지 않도록 함께 무효화.
      qc.invalidateQueries({ queryKey: favoriteKeys.all });
    },
  });
}
