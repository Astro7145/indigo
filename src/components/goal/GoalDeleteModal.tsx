'use client';

import Modal from '@/src/components/common/modal/Modal';
import { IcReport } from '@/src/components/common/icons';
import { useDeleteGoal } from '@/src/hooks/goal';

export interface GoalDeleteModalProps {
  onClose: () => void;
  goalId: number;
  /** 삭제 성공 후 호출 — 보통 목록/대시보드로 이동 */
  onDeleted: () => void;
}

/**
 * 목표 삭제 확인 모달 — Figma 21209:54657("popup"). 2차 검증용.
 * "확인" 시 useDeleteGoal로 실제 삭제 후 onDeleted를 호출한다.
 */
export default function GoalDeleteModal({ onClose, goalId, onDeleted }: GoalDeleteModalProps) {
  const del = useDeleteGoal();

  const handleDelete = () => {
    del.mutate(goalId, {
      onSuccess: () => {
        onDeleted();
      },
    });
  };

  return (
    <Modal open onClose={onClose}>
      <div className="flex flex-col gap-8 sm:gap-10">
        <div className="flex flex-col gap-1 text-center">
          <Modal.Title className="text-center">정말 삭제하시겠어요?</Modal.Title>
          <p className="text-destructive flex items-center justify-center gap-1 text-base font-medium">
            <IcReport aria-hidden className="text-destructive size-5" />
            삭제된 목표는 복구할 수 없습니다.
          </p>
        </div>
        <Modal.Actions>
          <Modal.Cancel onClick={onClose}>취소</Modal.Cancel>
          <Modal.Confirm onClick={handleDelete} disabled={del.isPending}>
            확인
          </Modal.Confirm>
        </Modal.Actions>
      </div>
    </Modal>
  );
}
