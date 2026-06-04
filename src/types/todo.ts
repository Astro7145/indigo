import type { CursorParams } from '@/src/types/common';

export interface TodoGoalRef {
  id: number;
  title: string;
}

export interface TodoTag {
  id: number;
  name: string;
}

export interface Todo {
  id: number;
  teamId: string;
  userId: number;
  goalId: number | null;
  title: string;
  done: boolean;
  fileUrl: string | null;
  linkUrl: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  goal: TodoGoalRef | null;
  noteIds: number[];
  tags: TodoTag[];
  isFavorite: boolean;
}

export interface TodoListParams extends CursorParams {
  goalId?: number;
  sort?: 'latest' | 'dueSoon';
  done?: 'true' | 'false';
  keyword?: string;
}

export interface TodoListResponse {
  todos: Todo[];
  nextCursor: number | null;
  totalCount: number;
}

export interface CreateTodoBody {
  title: string;
  goalId?: number;
  fileUrl?: string;
  linkUrl?: string;
  dueDate?: string;
  tags?: string[];
}

export interface UpdateTodoBody {
  title?: string;
  done?: boolean;
  goalId?: number | null;
  fileUrl?: string | null;
  linkUrl?: string | null;
  dueDate?: string | null;
  tags?: string[];
}
