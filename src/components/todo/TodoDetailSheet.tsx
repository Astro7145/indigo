'use client';

import BottomSheet from '@/src/components/common/BottomSheet';
import Modal from '@/src/components/common/modal/Modal';
import TodoDetailContent, { type TodoNoteRef } from '@/src/components/todo/TodoDetailContent';
import { useIsMobile } from '@/src/hooks/useIsMobile';
import type { Todo } from '@/src/types/todo';

interface TodoDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  todo: Todo;
  notes: TodoNoteRef[];
  onNoteClick: (noteId: number) => void;
}

/**
 * 할일 상세를 데스크탑은 모달, 모바일은 바텀시트로 표시하는 반응형 셸.
 * 데이터·동작은 주입 전용이며 내부에서 데이터를 페칭하지 않는다.
 */
export default function TodoDetailSheet({ isOpen, onClose, todo, notes, onNoteClick }: TodoDetailSheetProps) {
  const isMobile = useIsMobile();

  const content = <TodoDetailContent todo={todo} notes={notes} onClose={onClose} onNoteClick={onNoteClick} />;

  if (isMobile) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose}>
        {content}
      </BottomSheet>
    );
  }

  // Modal 기본 패딩(센터형 pt-12…)을 디자인의 p-40으로 덮어쓴다. cn(twMerge)이 p-10으로 방향 패딩을 override.
  return (
    <Modal open={isOpen} onClose={onClose} className="p-10">
      {content}
    </Modal>
  );
}
