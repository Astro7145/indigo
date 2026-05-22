import instance from '@/src/api/axiosInstance';
import type {
  Todo,
  TodoListParams,
  TodoListResponse,
  CreateTodoBody,
  UpdateTodoBody,
  FavoriteTodo,
  FavoriteTodoListResponse,
} from '@/src/types/todo';
import type { CursorParams } from '@/src/types/common';

export const todoKeys = {
  all: ['todo'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (filters: TodoListParams = {}) => [...todoKeys.lists(), filters] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (id: number) => [...todoKeys.details(), id] as const,
  favorites: (filters: CursorParams = {}) => [...todoKeys.all, 'favorites', filters] as const,
};

export async function getTodos(params: TodoListParams = {}): Promise<TodoListResponse> {
  const { data } = await instance.get<TodoListResponse>('/todos', { params });
  return data;
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
