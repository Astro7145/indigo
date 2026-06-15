'use client';

import { useTranslations } from 'next-intl';
import { useState, type KeyboardEvent } from 'react';

import Modal from '@/src/components/common/modal/Modal';
import Input from '@/src/components/common/inputs/Input';
import { useUpdateGoal } from '@/src/hooks/goal';

export interface GoalEditModalProps {
  onClose: () => void;
  goalId: number;
  currentTitle: string;
}

/**
 * 목표명 수정 모달 — 인풋 1개. "확인" 시 useUpdateGoal로 실제 수정 후 닫는다.
 * 열릴 때마다 새로 마운트되어(부모가 조건부 렌더) 현재 목표명으로 초기화된다.
 */
export default function GoalEditModal({ onClose, goalId, currentTitle }: GoalEditModalProps) {
  const tCommon = useTranslations('common');
  const tGoals = useTranslations('goals');
  const [title, setTitle] = useState(currentTitle);
  const update = useUpdateGoal();

  const trimmed = title.trim();
  const canSubmit = trimmed.length > 0 && !update.isPending;

  const submit = () => {
    if (!canSubmit) return;
    update.mutate(
      { goalId, body: { title: trimmed } },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <Modal open onClose={onClose} showCloseButton>
      <Modal.Title>{tGoals('edit.title')}</Modal.Title>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') submit();
        }}
        placeholder={tGoals('edit.placeholder')}
        autoFocus
        className="mt-4"
      />
      <Modal.Actions className="mt-6">
        <Modal.Cancel onClick={onClose}>{tCommon('actions.cancel')}</Modal.Cancel>
        <Modal.Confirm onClick={submit} disabled={!canSubmit}>
          {tCommon('actions.confirm')}
        </Modal.Confirm>
      </Modal.Actions>
    </Modal>
  );
}
