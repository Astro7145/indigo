import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  skipToken,
} from '@tanstack/react-query'
import {
  todoKeys,
  getTodos,
  getTodo,
  createTodo,
  patchTodo,
  deleteTodo,
  addTodoFavorite,
  removeTodoFavorite,
  getFavoriteTodos,
} from '@/src/api/todo'
import type {
  Todo,
  TodoListParams,
  TodoListResponse,
  CreateTodoBody,
  UpdateTodoBody,
  FavoriteTodo,
  FavoriteTodoListResponse,
} from '@/src/types/todo'
import type { CursorParams, ApiError } from '@/src/types/common'

// favorites filter 변형까지 한 번에 invalidate 하기 위한 prefix
export const favoritesPrefix = [...todoKeys.all, 'favorites'] as const

export function useTodoList(params: TodoListParams = {}) {
  return useQuery<TodoListResponse, ApiError>({
    queryKey: todoKeys.list(params),
    queryFn: () => getTodos(params),
  })
}

export function useInfiniteTodoList(
  params: Omit<TodoListParams, 'cursor'> = {},
) {
  return useInfiniteQuery<TodoListResponse, ApiError>({
    queryKey: [...todoKeys.list(params), 'infinite'],
    queryFn: ({ pageParam }) =>
      getTodos({ ...params, cursor: pageParam as number | undefined }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  })
}

export function useTodo(id: number | undefined) {
  return useQuery<Todo, ApiError>({
    queryKey:
      id == null ? [...todoKeys.details(), 'pending'] : todoKeys.detail(id),
    queryFn: id == null ? skipToken : () => getTodo(id),
  })
}

export function useFavoriteTodoList(params: CursorParams = {}) {
  return useQuery<FavoriteTodoListResponse, ApiError>({
    queryKey: todoKeys.favorites(params),
    queryFn: () => getFavoriteTodos(params),
  })
}

export function useInfiniteFavoriteTodoList(
  params: Omit<CursorParams, 'cursor'> = {},
) {
  return useInfiniteQuery<FavoriteTodoListResponse, ApiError>({
    queryKey: [...todoKeys.favorites(params), 'infinite'],
    queryFn: ({ pageParam }) =>
      getFavoriteTodos({ ...params, cursor: pageParam as number | undefined }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  })
}

export function useCreateTodo() {
  const qc = useQueryClient()
  return useMutation<Todo, ApiError, CreateTodoBody>({
    mutationFn: (body) => createTodo(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: todoKeys.lists() })
    },
  })
}

export function useUpdateTodo() {
  const qc = useQueryClient()
  return useMutation<Todo, ApiError, { todoId: number; body: UpdateTodoBody }>({
    mutationFn: ({ todoId, body }) => patchTodo(todoId, body),
    onSuccess: (_, { todoId }) => {
      qc.invalidateQueries({ queryKey: todoKeys.lists() })
      qc.invalidateQueries({ queryKey: todoKeys.detail(todoId) })
      // FavoriteTodo.todo가 title/done을 품으므로 favorites 변형도 동기화.
      qc.invalidateQueries({ queryKey: favoritesPrefix })
    },
  })
}

export function useDeleteTodo() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, number>({
    mutationFn: (id) => deleteTodo(id),
    onSuccess: (_, todoId) => {
      qc.invalidateQueries({ queryKey: todoKeys.lists() })
      qc.removeQueries({ queryKey: todoKeys.detail(todoId) })
      // 삭제된 todo가 favorites 목록에 남지 않도록 함께 무효화.
      qc.invalidateQueries({ queryKey: favoritesPrefix })
    },
  })
}

export function useAddTodoFavorite() {
  const qc = useQueryClient()
  return useMutation<FavoriteTodo, ApiError, number>({
    mutationFn: (todoId) => addTodoFavorite(todoId),
    onSuccess: (_, todoId) => {
      qc.invalidateQueries({ queryKey: todoKeys.lists() })
      qc.invalidateQueries({ queryKey: favoritesPrefix })
      qc.invalidateQueries({ queryKey: todoKeys.detail(todoId) })
    },
  })
}

export function useRemoveTodoFavorite() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, number>({
    mutationFn: (todoId) => removeTodoFavorite(todoId),
    onSuccess: (_, todoId) => {
      qc.invalidateQueries({ queryKey: todoKeys.lists() })
      qc.invalidateQueries({ queryKey: favoritesPrefix })
      qc.invalidateQueries({ queryKey: todoKeys.detail(todoId) })
    },
  })
}
