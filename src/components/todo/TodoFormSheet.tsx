'use client';

import { useState } from 'react';

import BottomSheet from '@/src/components/common/BottomSheet';
import Modal from '@/src/components/common/modal/Modal';
import TodoCreateContainer from '@/src/components/todo/TodoCreateContainer';
import TodoUpdateContainer from '@/src/components/todo/TodoUpdateContainer';
import { useIsMobile } from '@/src/hooks/useIsMobile';
import type { Todo } from '@/src/types/todo';

type TodoFormSheetProps =
  | { mode: 'create'; isOpen: boolean; onClose: () => void; defaultGoalId?: number; defaultDueDate?: string }
  | { mode: 'update'; isOpen: boolean; onClose: () => void; todo: Todo | null };

export default function TodoFormSheet(props: TodoFormSheetProps) {
  const { isOpen, onClose } = props;
  const isMobile = useIsMobile();
  const [showConfirm, setShowConfirm] = useState(false);

  const requestClose = () => setShowConfirm(true);
  const confirmClose = () => {
    setShowConfirm(false);
    onClose();
  };

  const content =
    props.mode === 'create' ? (
      <TodoCreateContainer
        defaultGoalId={props.defaultGoalId}
        defaultDueDate={props.defaultDueDate}
        onClose={onClose}
        onCancel={requestClose}
      />
    ) : props.todo ? (
      <TodoUpdateContainer todo={props.todo} onClose={onClose} onCancel={requestClose} />
    ) : null;

  return (
    <>
      {isMobile ? (
        <BottomSheet isOpen={isOpen} onClose={requestClose}>
          {content}
        </BottomSheet>
      ) : (
        <Modal open={isOpen} onClose={requestClose} className="p-4 sm:p-8">
          {content}
        </Modal>
      )}
      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        closeOnBackdropClick={false}
        className="w-[400px] pt-8 pb-6 sm:w-[400px] sm:pt-10 sm:pb-8"
      >
        <Modal.Title className="text-center">정말 나가시겠어요?</Modal.Title>
        <p className="my-5 text-center text-sm text-slate-500">작성 중인 내용이 사라집니다.</p>
        <Modal.Actions className="mt-2">
          <Modal.Cancel onClick={() => setShowConfirm(false)}>아니오</Modal.Cancel>
          <Modal.Confirm onClick={confirmClose}>예</Modal.Confirm>
        </Modal.Actions>
      </Modal>
    </>
  );
}
