'use client';

import TodoFormUI, { type TodoFormValues } from '@/src/components/todo/TodoFormUI';
import { useCreateTodo } from '@/src/hooks/todo';
import { useCreateImageUploadUrl } from '@/src/hooks/upload';
import { useToast } from '@/src/hooks/useToast';

interface TodoCreateContainerProps {
  /** 할 일 생성 성공 후 실제 닫기 */
  onClose: () => void;
  /** 취소 버튼 클릭 시 호출 — 확인 절차가 필요하면 호출자가 처리 */
  onCancel: () => void;
  /** 제출 진행(업로드~뮤테이션) 여부 보고 — 진행 중에는 호출자가 이탈 확인을 막는다 */
  onPendingChange?: (pending: boolean) => void;
  defaultGoalId?: number;
  /** 캘린더 등에서 마감일 프리필 (ISO) */
  defaultDueDate?: string;
}

export default function TodoCreateContainer({
  onClose,
  onCancel,
  onPendingChange,
  defaultGoalId,
  defaultDueDate,
}: TodoCreateContainerProps) {
  const { mutate: createTodo, isPending } = useCreateTodo();
  const { mutateAsync: createImageUploadUrl } = useCreateImageUploadUrl();
  const { showToast } = useToast();

  const handleSubmit = async (values: TodoFormValues) => {
    onPendingChange?.(true);
    let fileUrl: string | undefined;

    if (values.imageFile) {
      try {
        const { uploadUrl, url } = await createImageUploadUrl({ fileName: values.imageFile.name });
        const res = await fetch(uploadUrl, { method: 'PUT', body: values.imageFile });
        if (!res.ok) throw new Error(`upload failed: ${res.status}`);
        fileUrl = url;
      } catch {
        showToast('이미지 업로드에 실패했습니다.');
        onPendingChange?.(false);
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
        tags: values.tags.length > 0 ? values.tags.map((t) => t.text) : undefined,
      },
      {
        onSuccess: () => {
          showToast('할 일이 추가되었습니다.');
          onClose();
        },
        onError: () => {
          showToast('할 일 생성에 실패했습니다.');
          onPendingChange?.(false);
        },
      },
    );
  };

  return (
    <TodoFormUI
      onSubmit={handleSubmit}
      onClose={onCancel}
      title="할 일 생성"
      submitLabel="확인"
      initialValues={{ goalId: defaultGoalId, dueDate: defaultDueDate }}
      disableSubmitUntilValid
      isPending={isPending}
    />
  );
}
