'use client';

import { useTranslations } from 'next-intl';

import Modal from '@/src/components/common/modal/Modal';
import { IcReport } from '@/src/components/common/icons';
import { useDeleteNote } from '@/src/hooks/note/note';
import { useToast } from '@/src/hooks/useToast';
import type { Note } from '@/src/types/note';

interface NoteDeleteConfirmProps {
  note: Note;
  /** 취소·삭제 성공 후 모달을 닫는다(ModalStack의 controls.close). */
  onClose: () => void;
}

/**
 * 노트 삭제 확인 다이얼로그 (Figma 21209:54657). 노트 카드 케밥 "삭제하기"로 ModalStack에 열린다.
 * Modal shell(ModalStack)이 씌워주므로 내용만 담는다. 삭제 뮤테이션·토스트·pending을 자체 소유한다.
 */
export default function NoteDeleteConfirm({ note, onClose }: NoteDeleteConfirmProps) {
  const tCommon = useTranslations('common');
  const tNote = useTranslations('note');
  const del = useDeleteNote();
  const { showToast } = useToast();

  const handleConfirm = () => {
    del.mutate(note.id, {
      onSuccess: () => {
        showToast(tNote('delete.success'));
        onClose();
      },
      onError: () => showToast(tNote('delete.error')),
    });
  };

  return (
    <>
      <div className="flex flex-col gap-1">
        <Modal.Title className="text-center">{tCommon('deleteConfirm.title')}</Modal.Title>
        <p className="text-destructive flex items-center justify-center gap-1 text-base font-medium">
          <IcReport aria-hidden className="text-destructive size-5" />
          <span>{tNote('delete.warning')}</span>
        </p>
      </div>
      <Modal.Actions className="mt-10">
        <Modal.Cancel onClick={onClose} disabled={del.isPending}>
          {tCommon('actions.cancel')}
        </Modal.Cancel>
        <Modal.Confirm onClick={handleConfirm} disabled={del.isPending}>
          {tCommon('actions.confirm')}
        </Modal.Confirm>
      </Modal.Actions>
    </>
  );
}
