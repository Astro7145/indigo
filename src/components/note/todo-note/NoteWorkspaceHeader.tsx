import { useTranslations } from 'next-intl';

import Button from '@/src/components/common/buttons/Button';
import type { NoteWorkspaceMode } from '@/src/components/note/todo-note/NoteWorkspace';

interface NoteWorkspaceHeaderProps {
  mode: NoteWorkspaceMode;
  isValid: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
  onEdit: () => void;
  onClose?: () => void;
}

export default function NoteWorkspaceHeader({
  mode,
  isValid,
  isSubmitting,
  onCancel,
  onSaveDraft,
  onSubmit,
  onEdit,
  onClose,
}: NoteWorkspaceHeaderProps) {
  const t = useTranslations('note');
  const tc = useTranslations('common');
  const editing = mode !== 'read';
  const isCreate = mode === 'create';
  const headingText = isCreate ? t('heading.create') : t('heading.edit');
  const submitText = isCreate ? t('submit') : tc('actions.edit');

  return (
    <header className="mb-4 flex h-10 items-center justify-between gap-3 sm:mb-3">
      <h1
        className={`min-w-0 truncate text-xl font-semibold tracking-[-0.03em] text-slate-800 sm:text-2xl ${editing ? 'block' : 'hidden'}`}
      >
        {headingText}
      </h1>
      {editing ? (
        <div className="flex shrink-0 gap-2">
          <Button
            variant="tertiary"
            size="small"
            onClick={onCancel}
            disabled={isSubmitting}
            className="sm:h-10 sm:w-[106px] sm:px-0 sm:py-0 sm:text-base"
          >
            {tc('actions.cancel')}
          </Button>
          <Button
            variant="secondary"
            size="small"
            onClick={onSaveDraft}
            disabled={isSubmitting}
            className="sm:h-10 sm:w-[106px] sm:px-0 sm:py-0 sm:text-base"
          >
            {t('saveDraft')}
          </Button>
          <Button
            variant="primary"
            size="small"
            disabled={!isValid || isSubmitting}
            onClick={onSubmit}
            className="sm:h-10 sm:w-[106px] sm:px-0 sm:py-0 sm:text-base"
          >
            {submitText}
          </Button>
        </div>
      ) : (
        <div className="ml-auto flex shrink-0 gap-2">
          {onClose && (
            <Button
              variant="tertiary"
              size="small"
              onClick={onClose}
              className="sm:h-10 sm:w-[106px] sm:px-0 sm:py-0 sm:text-base"
            >
              {tc('actions.close')}
            </Button>
          )}
          <Button
            variant="primary"
            size="small"
            onClick={onEdit}
            className="sm:h-10 sm:w-[106px] sm:px-0 sm:py-0 sm:text-base"
          >
            {tc('actions.edit')}
          </Button>
        </div>
      )}
    </header>
  );
}
