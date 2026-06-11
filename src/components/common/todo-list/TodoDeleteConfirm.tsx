'use client';

import Modal from '@/src/components/common/modal/Modal';
import { IcReport } from '@/src/components/common/icons';
import { useDeleteTodo } from '@/src/hooks/todo';
import { useToast } from '@/src/hooks/useToast';
import type { Todo } from '@/src/types/todo';

interface TodoDeleteConfirmProps {
  open: boolean;
  todo: Todo | null;
  onClose: () => void;
}

/**
 * 할일 삭제 확인 모달 (Figma 21209:54657). 케밥 메뉴 "삭제하기"로 열린다.
 * 삭제 뮤테이션·토스트·pending을 자체 소유하는 자기완결 컴포넌트 — 호출 측은 open/todo/onClose만 전달.
 */
export default function TodoDeleteConfirm({ open, todo, onClose }: TodoDeleteConfirmProps) {
  const del = useDeleteTodo();
  const { showToast } = useToast();

  const handleConfirm = () => {
    if (!todo) return;
    del.mutate(todo.id, {
      onSuccess: () => {
        showToast('할 일이 삭제되었습니다.');
        onClose();
      },
      onError: () => showToast('할 일 삭제에 실패했습니다.'),
    });
  };

  return (
    <Modal open={open && todo !== null} onClose={onClose}>
      <div className="flex flex-col gap-1">
        <Modal.Title className="text-center">정말 삭제하시겠어요?</Modal.Title>
        <p className="text-destructive flex items-center justify-center gap-1 text-base font-medium">
          <IcReport aria-hidden className="text-destructive size-5" />
          <span>삭제된 할 일은 복구할 수 없습니다.</span>
        </p>
      </div>
      <Modal.Actions className="mt-10">
        <Modal.Cancel>취소</Modal.Cancel>
        <Modal.Confirm onClick={handleConfirm} disabled={del.isPending}>
          확인
        </Modal.Confirm>
      </Modal.Actions>
    </Modal>
  );
}
