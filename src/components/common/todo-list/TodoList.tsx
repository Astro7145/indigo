'use client';

import type { ReactNode, Ref } from 'react';

import TodoRow from '@/src/components/common/todo-list/TodoRow';
import type { TodoItemSize } from '@/src/components/common/todo-list/TodoItem';
import { useAddTodoFavorite, useRemoveTodoFavorite } from '@/src/hooks/favorite';
import { useUpdateTodo } from '@/src/hooks/todo';
import type { Todo } from '@/src/types/todo';

export interface TodoListProps {
  todos: Todo[];
  /** TodoItem 크기 — 컬럼(large)·보드(responsive) 등 호출 맥락에 맞춘다. */
  size: TodoItemSize;
  /** 케밥 "수정하기" → 호출 측이 소유한 수정 시트로 연결. */
  onEdit: (todo: Todo) => void;
  /** 행 클릭 → 호출 측이 소유한 상세 시트로 연결. */
  onSelect: (todo: Todo) => void;
  /** ul 스타일 — 간격·스크롤 영역은 호출 측이 소유한다. */
  className?: string;
  /** ul ref — 무한 스크롤 IntersectionObserver root 등. */
  ref?: Ref<HTMLUListElement>;
  /** 행 뒤에 렌더되는 추가 항목 — 무한 스크롤 sentinel/로딩 `<li>` 슬롯. */
  children?: ReactNode;
}

/**
 * 할 일 목록 — todos를 `TodoRow`로 매핑하고, 완료 토글·즐겨찾기 mutation 배선을 소유한다
 * (훅은 목록당 1회 마운트 — 행마다 mutation 인스턴스가 쌓이지 않는다).
 * 수정/상세 시트는 페이지가 단일 인스턴스로 소유하는 기존 패턴을 따르므로 onEdit/onSelect만 콜백으로 받는다.
 */
export default function TodoList({ todos, size, onEdit, onSelect, className, ref, children }: TodoListProps) {
  const update = useUpdateTodo();
  const addFavorite = useAddTodoFavorite();
  const removeFavorite = useRemoveTodoFavorite();

  const toggle = (id: number, done: boolean) => update.mutate({ todoId: id, body: { done } });
  const toggleFavorite = (id: number, isFavorite: boolean) =>
    isFavorite ? removeFavorite.mutate(id) : addFavorite.mutate(id);

  return (
    <ul ref={ref} className={className}>
      {todos.map((t) => (
        <TodoRow
          key={t.id}
          size={size}
          todo={t}
          onToggle={toggle}
          onToggleFavorite={toggleFavorite}
          onEdit={onEdit}
          onSelect={onSelect}
        />
      ))}
      {children}
    </ul>
  );
}
