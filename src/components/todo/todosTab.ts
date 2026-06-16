import type { TodoListParams } from '@/src/types/todo';

// 서버 page(파싱·prefetch)와 클라 TodosView가 공유 — 'use client' 모듈에 두면 서버에서 호출할 수 없다.
export type TodosTab = 'all' | 'todo' | 'done';

/** ?tab= 파싱 — 잘못된 값은 all */
export function parseTodosTab(raw: string | undefined): TodosTab {
  return raw === 'todo' || raw === 'done' ? raw : 'all';
}

const DONE_PARAM: Record<TodosTab, TodoListParams['done']> = {
  all: undefined,
  todo: 'false',
  done: 'true',
};

export const todosListParams = (tab: TodosTab): Omit<TodoListParams, 'cursor'> => ({
  sort: 'latest',
  limit: 40,
  done: DONE_PARAM[tab],
});
