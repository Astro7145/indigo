'use client';

import { CalendarDate } from '@internationalized/date';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Dropdown from '@/src/components/common/dropdown/Dropdown';
import { IcBadgeClose, IcChevron, IcLink } from '@/src/components/common/icons';
import ImageInput from '@/src/components/common/inputs/ImageInput';
import Input from '@/src/components/common/inputs/Input';
import Modal from '@/src/components/common/modal/Modal';
import DatePicker from '@/src/components/todo/date-picker/DatePicker';
import TagInput, { type Tag } from '@/src/components/todo/TagInput';
import { useGoalList } from '@/src/hooks/goal';
import { useCreateTodo } from '@/src/hooks/todo';
import { useCreateImageUploadUrl } from '@/src/hooks/upload';
import { useToast } from '@/src/hooks/useToast';
import { calendarDateToIso } from '@/src/utils/date';
import { todoCreateSchema, type TodoCreateValues } from '@/src/utils/schema';

interface TodoCreateFormProps {
  onClose: () => void;
  defaultGoalId?: number;
}

export default function TodoCreateForm({ onClose, defaultGoalId }: TodoCreateFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<TodoCreateValues>({
    resolver: zodResolver(todoCreateSchema),
    defaultValues: { goalId: defaultGoalId, dueDate: '', linkUrl: '' },
  });

  const { data: goalData } = useGoalList();
  const watchedGoalId = watch('goalId');
  const watchedLinkUrl = watch('linkUrl');
  const selectedGoal = goalData?.goals.find((g) => g.id === watchedGoalId);

  const { mutateAsync: createTodo } = useCreateTodo();
  const { mutateAsync: createImageUploadUrl } = useCreateImageUploadUrl();
  const { showToast } = useToast();

  const [selectedDate, setSelectedDate] = useState<CalendarDate | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const onSubmit = handleSubmit(async (data) => {
    let fileUrl: string | undefined;

    if (imageFile) {
      try {
        const { uploadUrl, url } = await createImageUploadUrl({ fileName: imageFile.name });
        const res = await fetch(uploadUrl, { method: 'PUT', body: imageFile });
        if (!res.ok) throw new Error(`upload failed: ${res.status}`);
        fileUrl = url;
      } catch {
        showToast('이미지 업로드에 실패했습니다.');
        return;
      }
    }

    await createTodo(
      {
        title: data.title,
        goalId: data.goalId,
        dueDate: data.dueDate,
        linkUrl: data.linkUrl || undefined,
        fileUrl,
        tags: tags.length > 0 ? tags.map((t) => t.text) : undefined,
      },
      {
        onSuccess: () => {
          showToast('할 일이 추가되었습니다.');
          onClose();
        },
        onError: () => {
          showToast('할 일 생성에 실패했습니다.');
        },
      },
    );
  });

  return (
    <>
      <Modal.Title className="mb-4">할 일 생성</Modal.Title>
      <form
        noValidate
        className="scrollbar-slate -mr-4 flex min-h-0 flex-1 scrollbar-gutter-stable flex-col overflow-y-auto py-4 pr-4 sm:-mr-8 sm:pr-8"
      >
        {/* 제목 */}
        <div className="flex flex-col gap-2">
          <label className="px-1 text-base font-semibold text-slate-700">
            제목 <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="할 일의 제목을 적어주세요"
            variant={errors.title ? 'error' : 'default'}
            {...register('title')}
          />
          <small role="alert" className="text-destructive h-6 px-1 text-sm font-medium">
            {errors.title?.message}
          </small>
        </div>

        {/* 목표 */}
        <div className="flex flex-col gap-2 pb-8">
          <span className="px-1 text-base font-semibold text-slate-700">목표</span>
          <Dropdown>
            <Dropdown.Trigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-sm border border-slate-300 p-4 text-base text-slate-700 focus:border-indigo-500 focus:outline-none"
              >
                {selectedGoal?.title ?? '목표를 선택해주세요'}
                <IcChevron direction="down" className="size-4 shrink-0 text-slate-400" />
              </button>
            </Dropdown.Trigger>
            <Dropdown.Menu size="full">
              <Dropdown.Item onClick={() => setValue('goalId', undefined)}>목표 없음</Dropdown.Item>
              {goalData?.goals.map((goal) => (
                <Dropdown.Item key={goal.id} onClick={() => setValue('goalId', goal.id)}>
                  {goal.title}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {/* 마감기한 */}
        <div className="flex flex-col gap-2">
          <span className="px-1 text-base font-semibold text-slate-700">
            마감기한 <span className="text-destructive">*</span>
          </span>
          <DatePicker
            value={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
              setValue('dueDate', calendarDateToIso(date) ?? '', { shouldValidate: true });
            }}
            onBlur={() => trigger('dueDate')}
          />
          <small role="alert" className="text-destructive h-6 px-1 text-sm font-medium">
            {errors.dueDate?.message}
          </small>
        </div>

        {/* 태그 */}
        <div className="flex flex-col gap-2 pb-8">
          <span className="px-1 text-base font-semibold text-slate-700">태그</span>
          <TagInput value={tags} onChange={setTags} />
        </div>

        {/* 링크 */}
        <div className="flex flex-col gap-2">
          <label htmlFor="link-input" className="px-1 text-base font-semibold text-slate-700">
            링크
          </label>
          <div className="flex items-center gap-2 rounded-sm border border-dashed border-slate-300 bg-slate-50 p-4 focus-within:border-indigo-500">
            <IcLink className="size-6 shrink-0 text-slate-500" />
            <input
              id="link-input"
              type="text"
              placeholder="링크를 업로드해주세요"
              className="min-w-0 flex-1 bg-transparent text-base text-slate-700 outline-none placeholder:text-slate-500"
              {...register('linkUrl')}
            />
            {watchedLinkUrl && (
              <button type="button" onClick={() => setValue('linkUrl', '')} className="shrink-0" aria-label="링크 삭제">
                <IcBadgeClose className="size-5 text-slate-400" />
              </button>
            )}
          </div>
          <small role="alert" className="text-destructive h-6 px-1 text-sm font-medium">
            {errors.linkUrl?.message}
          </small>
        </div>

        {/* 이미지 */}
        <div className="flex flex-col gap-2">
          <span className="px-1 text-base font-semibold text-slate-700">이미지</span>
          <ImageInput onFileChange={setImageFile} />
          <p className="text-sm font-medium text-slate-400">이미지는 최대 1개만 첨부할 수 있습니다.</p>
        </div>
      </form>
      <Modal.Actions className="mt-4">
        <Modal.Cancel onClick={onClose}>취소</Modal.Cancel>
        <Modal.Confirm onClick={onSubmit}>확인</Modal.Confirm>
      </Modal.Actions>
    </>
  );
}
