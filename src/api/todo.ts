import instance from '@/src/api/client-fetcher';
import type { Todo, TodoListParams, TodoListResponse, CreateTodoBody, UpdateTodoBody } from '@/src/types/todo';

export const todoKeys = {
  all: ['todo'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (filters: TodoListParams = {}) => [...todoKeys.lists(), filters] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (id: number) => [...todoKeys.details(), id] as const,
};

export async function getTodos(params: TodoListParams = {}): Promise<TodoListResponse> {
  const { data } = await instance.get<TodoListResponse>('/todos', { params });
  return data;
}

/**
 * 주어진 필터로 nextCursor 끝까지 따라가 todo를 전부 합친다 — 페이지 한도(limit 최대 100) 때문에
 * 단일 호출로는 누락될 수 있는 화면(캘린더의 월 범위 조회 등)에서 완전성을 보장한다.
 */
export async function getAllTodos(
  params: Omit<TodoListParams, 'cursor' | 'limit'> = {},
  limit = 100,
): Promise<TodoListResponse> {
  const todos: Todo[] = [];
  let cursor: number | undefined;
  let totalCount = 0;
  do {
    const page = await getTodos({ ...params, cursor, limit });
    todos.push(...page.todos);
    totalCount = page.totalCount;
    cursor = page.nextCursor ?? undefined;
  } while (cursor !== undefined);
  return { todos, nextCursor: null, totalCount };
}

export async function getTodo(todoId: number): Promise<Todo> {
  const { data } = await instance.get<Todo>(`/todos/${todoId}`);
  return data;
}

export async function createTodo(body: CreateTodoBody): Promise<Todo> {
  const { data } = await instance.post<Todo>('/todos', body);
  return data;
}

export async function patchTodo(todoId: number, body: UpdateTodoBody): Promise<Todo> {
  const { data } = await instance.patch<Todo>(`/todos/${todoId}`, body);
  return data;
}

export async function deleteTodo(todoId: number): Promise<void> {
  await instance.delete(`/todos/${todoId}`);
}
