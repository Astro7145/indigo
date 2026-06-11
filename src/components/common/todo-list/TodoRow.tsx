'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

import TodoItem from '@/src/components/common/todo-list/TodoItem';
import type { TodoItemSize } from '@/src/components/common/todo-list/TodoItem';
import TodoDeleteConfirm from '@/src/components/common/todo-list/TodoDeleteConfirm';
import type { Todo } from '@/src/types/todo';

export interface TodoRowProps {
  todo: Todo;
  /** TodoItem 크기 — 컬럼(large)·보드(responsive) 등 호출 맥락에 맞춘다. */
  size: TodoItemSize;
  onToggle: (id: number, done: boolean) => void;
  onToggleFavorite: (id: number, isFavorite: boolean) => void;
  onEdit: (todo: Todo) => void;
  onSelect: (todo: Todo) => void;
}

/**
 * 할 일 행 — `TodoItem` + 액션(노트/링크/노트작성/케밥/별) + 삭제 확인 + 등장 애니메이션.
 * 행 클릭은 상세 선택(onSelect), 케밥은 수정(onEdit)/삭제로 연결되며 삭제 확인 모달을 행 로컬로 소유한다.
 */
export default function TodoRow({ todo, size, onToggle, onToggleFavorite, onEdit, onSelect }: TodoRowProps) {
  // 타입상 noteIds는 required지만 백엔드 응답 누락/null 케이스를 방어한다.
  const hasNote = (todo.noteIds?.length ?? 0) > 0;
  // 삭제 확인 모달 열림 상태 — 행 로컬로 소유.
  const [confirmOpen, setConfirmOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="rounded transition-shadow hover:shadow-[0_2px_8px_0_rgba(0,0,0,0.08)]"
    >
      <TodoItem
        size={size}
        title={todo.title}
        checked={todo.done}
        onCheckedChange={(done) => onToggle(todo.id, done)}
        onClick={() => onSelect(todo)}
      >
        <TodoItem.Actions>
          {/* 시안 순서: 노트(인디케이터) · 링크 · 노트작성(연필) · 케밥 · 별 */}
          {hasNote && <TodoItem.NoteAction onClick={() => {}} />}
          {todo.linkUrl && <TodoItem.LinkAction onClick={() => {}} />}
          {/* 노트 없으면 hover 시 노트 작성(연필) 노출 — 노트 작성 모달(별도 작업) 연동 전 placeholder */}
          {!hasNote && <TodoItem.EditAction onClick={() => {}} hoverOnly aria-label="노트 작성" />}
          <TodoItem.KebabAction hoverOnly onEdit={() => onEdit(todo)} onDelete={() => setConfirmOpen(true)} />
          <TodoItem.StarAction active={todo.isFavorite} onClick={() => onToggleFavorite(todo.id, todo.isFavorite)} />
        </TodoItem.Actions>
      </TodoItem>
      {/* 닫혀 있을 땐 마운트하지 않아 행마다 useDeleteTodo/useToast 인스턴스가 쌓이지 않게 한다. */}
      {confirmOpen && <TodoDeleteConfirm open todo={todo} onClose={() => setConfirmOpen(false)} />}
    </motion.li>
  );
}
