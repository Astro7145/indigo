import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  skipToken,
  type QueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { todoKeys, getTodos, getTodo, createTodo, patchTodo, deleteTodo } from '@/src/api/todo';
import { favoriteKeys } from '@/src/api/favorite';
import { goalKeys } from '@/src/api/goal';
import type { Todo, TodoListParams, TodoListResponse, CreateTodoBody, UpdateTodoBody } from '@/src/types/todo';
import type { ApiError } from '@/src/types/common';

export function useTodoList(params: TodoListParams = {}, enabled = true) {
  return useQuery<TodoListResponse, ApiError>({
    queryKey: todoKeys.list(params),
    queryFn: () => getTodos(params),
    enabled,
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

/**
 * 캐시된 모든 todo 리스트(useQuery·useInfiniteQuery)에서 해당 todo를 patch한다.
 * 낙관적 업데이트(완료체크·즐겨찾기)에서 공통 사용 — 서버 응답을 기다리지 않고 UI 즉시 반영.
 */
export function patchTodoInCaches(qc: QueryClient, todoId: number, patch: Partial<Todo>) {
  qc.setQueriesData<TodoListResponse | { pages: TodoListResponse[] }>({ queryKey: todoKeys.lists() }, (old) => {
    if (!old) return old;
    const apply = (todos: Todo[]) => todos.map((t) => (t.id === todoId ? { ...t, ...patch } : t));
    return 'pages' in old
      ? { ...old, pages: old.pages.map((p) => ({ ...p, todos: apply(p.todos) })) }
      : { ...old, todos: apply(old.todos) };
  });
}

export function useUpdateTodo() {
  const qc = useQueryClient();
  return useMutation<Todo, ApiError, { todoId: number; body: UpdateTodoBody }, { prev: [QueryKey, unknown][] }>({
    mutationFn: ({ todoId, body }) => patchTodo(todoId, body),
    // 낙관적: done을 캐시에 즉시 반영(체크·To Do↔Done 컬럼 이동 즉시). 실패 시 onError에서 롤백.
    onMutate: async ({ todoId, body }) => {
      await qc.cancelQueries({ queryKey: todoKeys.lists() });
      const prev = qc.getQueriesData({ queryKey: todoKeys.lists() });
      if (body.done !== undefined) patchTodoInCaches(qc, todoId, { done: body.done });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.prev.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    // PATCH 응답 shape가 GET 응답과 동일하므로 detail 캐시 직접 갱신.
    onSuccess: (data, { todoId }) => {
      qc.setQueryData(todoKeys.detail(todoId), data);
    },
    // 서버 확정 후 동기화: 리스트(재검증)·favorites·목표 진척도(completedCount/todoCount).
    onSettled: () => {
      qc.invalidateQueries({ queryKey: todoKeys.lists() });
      qc.invalidateQueries({ queryKey: favoriteKeys.all });
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
