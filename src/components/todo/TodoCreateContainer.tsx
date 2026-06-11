'use client';

import { useTranslations } from 'next-intl';

import TodoFormUI, { type TodoFormValues } from '@/src/components/todo/TodoFormUI';
import { useCreateTodo } from '@/src/hooks/todo';
import { useCreateImageUploadUrl } from '@/src/hooks/upload';
import { useToast } from '@/src/hooks/useToast';

interface TodoCreateContainerProps {
  /** 할 일 생성 성공 후 실제 닫기 */
  onClose: () => void;
  /** 취소 버튼 클릭 시 호출 — 확인 절차가 필요하면 호출자가 처리 */
  onCancel: () => void;
  defaultGoalId?: number;
}

export default function TodoCreateContainer({ onClose, onCancel, defaultGoalId }: TodoCreateContainerProps) {
  const { mutate: createTodo, isPending } = useCreateTodo();
  const { mutateAsync: createImageUploadUrl } = useCreateImageUploadUrl();
  const { showToast } = useToast();
  const t = useTranslations('todos');
  const tc = useTranslations('common');

  const handleSubmit = async (values: TodoFormValues) => {
    let fileUrl: string | undefined;

    if (values.imageFile) {
      try {
        const { uploadUrl, url } = await createImageUploadUrl({ fileName: values.imageFile.name });
        const res = await fetch(uploadUrl, { method: 'PUT', body: values.imageFile });
        if (!res.ok) throw new Error(`upload failed: ${res.status}`);
        fileUrl = url;
      } catch {
        showToast(t('imageUploadError'));
        return;
      }
    }

    createTodo(
      {
        title: values.title,
        goalId: values.goalId,
        dueDate: values.dueDate,
        linkUrl: values.linkUrl || undefined,
        fileUrl,
        tags: values.tags.length > 0 ? values.tags.map((tag) => tag.text) : undefined,
      },
      {
        onSuccess: () => {
          showToast(t('create.success'));
          onClose();
        },
        onError: () => {
          showToast(t('create.error'));
        },
      },
    );
  };

  return (
    <TodoFormUI
      onSubmit={handleSubmit}
      onClose={onCancel}
      title={t('create.title')}
      submitLabel={tc('actions.confirm')}
      initialValues={{ goalId: defaultGoalId }}
      disableSubmitUntilValid
      isPending={isPending}
    />
  );
}
