'use client';

import { useTranslations } from 'next-intl';

import type { BadgeColor } from '@/src/components/common/badges/Badge';
import TodoFormUI, { type TodoFormValues } from '@/src/components/todo/TodoFormUI';
import { useUpdateTodo } from '@/src/hooks/todo';
import { useCreateImageUploadUrl } from '@/src/hooks/upload';
import { useToast } from '@/src/hooks/useToast';
import type { Todo } from '@/src/types/todo';

const BADGE_COLORS: BadgeColor[] = ['green', 'yellow', 'red', 'purple', 'gray'];

interface TodoUpdateContainerProps {
  todo: Todo;
  onClose: () => void;
  onCancel?: () => void;
  /** 제출 진행(업로드~뮤테이션) 여부 보고 — 진행 중에는 호출자가 이탈 확인을 막는다 */
  onPendingChange?: (pending: boolean) => void;
}

export default function TodoUpdateContainer({ todo, onClose, onCancel, onPendingChange }: TodoUpdateContainerProps) {
  const tCommon = useTranslations('common');
  const tTodos = useTranslations('todos');
  const { mutate: updateTodo, isPending } = useUpdateTodo();
  const { mutateAsync: createImageUploadUrl } = useCreateImageUploadUrl();
  const { showToast } = useToast();

  const initialValues: Partial<TodoFormValues> = {
    title: todo.title,
    goalId: todo.goalId ?? undefined,
    dueDate: todo.dueDate ?? '',
    linkUrl: todo.linkUrl ?? '',
    tags: todo.tags?.map((t, i) => ({ text: t.name, color: BADGE_COLORS[i % BADGE_COLORS.length] })) ?? [],
    imageFile: null,
    fileUrl: todo.fileUrl,
    done: todo.done,
  };

  const handleSubmit = async (values: TodoFormValues) => {
    onPendingChange?.(true);
    // values.fileUrl: null이면 사용자가 명시적으로 삭제, 아니면 기존 URL 유지
    let fileUrl: string | null = values.fileUrl ?? null;

    if (values.imageFile) {
      try {
        const { uploadUrl, url } = await createImageUploadUrl({ fileName: values.imageFile.name });
        const res = await fetch(uploadUrl, { method: 'PUT', body: values.imageFile });
        if (!res.ok) throw new Error(`upload failed: ${res.status}`);
        fileUrl = url;
      } catch {
        showToast(tTodos('imageUploadError'));
        onPendingChange?.(false);
        return;
      }
    }

    updateTodo(
      {
        todoId: todo.id,
        body: {
          title: values.title,
          goalId: values.goalId ?? null,
          dueDate: values.dueDate || null,
          linkUrl: values.linkUrl || null,
          fileUrl,
          done: values.done,
          tags: values.tags.map((t) => t.text),
        },
      },
      {
        onSuccess: () => {
          showToast(tTodos('update.success'));
          onClose();
        },
        onError: () => {
          showToast(tTodos('update.error'));
          onPendingChange?.(false);
        },
      },
    );
  };

  return (
    <TodoFormUI
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onClose={onCancel ?? onClose}
      title={tTodos('update.title')}
      submitLabel={tCommon('actions.update')}
      isPending={isPending}
    />
  );
}
