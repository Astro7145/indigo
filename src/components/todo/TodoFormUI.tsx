'use client';

import { CalendarDate } from '@internationalized/date';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Button from '@/src/components/common/buttons/Button';
import Dropdown from '@/src/components/common/dropdown/Dropdown';
import { IcChevron, IcDelete } from '@/src/components/common/icons';
import ImageInput from '@/src/components/common/inputs/ImageInput';
import Input from '@/src/components/common/inputs/Input';
import LinkInput from '@/src/components/common/inputs/LinkInput';
import StatusField from '@/src/components/todo/StatusField';
import DatePicker from '@/src/components/todo/date-picker/DatePicker';
import TagInput, { type Tag } from '@/src/components/todo/TagInput';
import { useGoalList } from '@/src/hooks/goal';
import { calendarDateToIso, isoToCalendarDate } from '@/src/utils/date';
import { todoCreateSchema, type TodoCreateValues } from '@/src/utils/schema';

export interface TodoFormValues {
  title: string;
  goalId?: number;
  dueDate: string;
  linkUrl?: string;
  tags: Tag[];
  imageFile: File | null;
  fileUrl?: string | null;
  done?: boolean;
}

interface TodoFormUIProps {
  initialValues?: Partial<TodoFormValues>;
  onSubmit: (values: TodoFormValues) => void | Promise<void>;
  onClose: () => void;
  title: string;
  submitLabel: string;
  disableSubmitUntilValid?: boolean;
  /** mutation 진행 중 여부 — 제출 버튼 중복 클릭 방지 */
  isPending?: boolean;
}

export default function TodoFormUI({
  initialValues,
  onSubmit,
  onClose,
  title,
  submitLabel,
  disableSubmitUntilValid,
  isPending,
}: TodoFormUIProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isValid, isSubmitting },
  } = useForm<TodoCreateValues>({
    resolver: zodResolver(todoCreateSchema),
    mode: 'onChange',
    defaultValues: {
      title: initialValues?.title ?? '',
      goalId: initialValues?.goalId,
      dueDate: initialValues?.dueDate ?? '',
      linkUrl: initialValues?.linkUrl ?? '',
    },
  });

  const { data: goalData } = useGoalList({ limit: 100 });
  const watchedGoalId = watch('goalId');
  const watchedLinkUrl = watch('linkUrl');
  const selectedGoal = goalData?.goals.find((g) => g.id === watchedGoalId);

  const [selectedDate, setSelectedDate] = useState<CalendarDate | null>(() =>
    isoToCalendarDate(initialValues?.dueDate || null),
  );
  const [tags, setTags] = useState<Tag[]>(initialValues?.tags ?? []);
  const [imageFile, setImageFile] = useState<File | null>(initialValues?.imageFile ?? null);
  const [fileUrl, setFileUrl] = useState<string | null>(initialValues?.fileUrl ?? null);
  const [done, setDone] = useState<boolean | undefined>(initialValues?.done);
  const [doneError, setDoneError] = useState(false);

  const showStatusField = initialValues?.done !== undefined;
  const canSubmit = isValid && (!showStatusField || done !== undefined);
  const submitting = isSubmitting || isPending;

  const handleSubmit_ = handleSubmit(async (data) => {
    if (showStatusField && done === undefined) {
      setDoneError(true);
      return;
    }
    await onSubmit({
      title: data.title,
      goalId: data.goalId,
      dueDate: data.dueDate,
      linkUrl: data.linkUrl,
      tags,
      imageFile,
      fileUrl,
      ...(showStatusField && { done }),
    });
  });

  return (
    <>
      <div className="flex shrink-0 items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
        <button type="button" onClick={onClose} aria-label="닫기">
          <IcDelete className="size-6 text-slate-400" />
        </button>
      </div>
      <form
        noValidate
        onSubmit={handleSubmit_}
        className="scrollbar-slate -mr-8 flex min-h-0 flex-1 scrollbar-gutter-stable flex-col overflow-y-auto py-4 pr-8 pl-1"
      >
        {/* 상태 — 수정 폼에서만 표시 */}
        {showStatusField && (
          <StatusField
            value={done}
            onChange={(val) => {
              setDone(val);
              setDoneError(false);
            }}
            error={doneError}
          />
        )}

        {/* 제목 */}
        <div className="flex flex-col gap-2">
          <label className="px-1 text-sm font-semibold text-slate-700 sm:text-base">
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
          <span className="px-1 text-sm font-semibold text-slate-700 sm:text-base">목표</span>
          <Dropdown>
            <Dropdown.Trigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-sm border border-slate-300 p-3 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none sm:p-4 sm:text-base"
              >
                {selectedGoal?.title ?? '목표를 선택해주세요'}
                <IcChevron direction="down" className="size-5 shrink-0 text-slate-400 sm:size-6" />
              </button>
            </Dropdown.Trigger>
            <Dropdown.Menu size="full" className="scrollbar-slate max-h-60 overflow-y-auto">
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
          <span className="px-1 text-sm font-semibold text-slate-700 sm:text-base">
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
        <div className="flex flex-col gap-2">
          <span className="px-1 text-sm font-semibold text-slate-700 sm:text-base">태그</span>
          <TagInput value={tags} onChange={setTags} />
        </div>

        {/* 링크 */}
        <div className="flex flex-col gap-2">
          <label htmlFor="link-input" className="px-1 text-sm font-semibold text-slate-700 sm:text-base">
            링크
          </label>
          <LinkInput
            id="link-input"
            {...register('linkUrl')}
            showClear={!!watchedLinkUrl}
            onClear={() => setValue('linkUrl', '')}
          />
          <small role="alert" className="text-destructive h-6 px-1 text-sm font-medium">
            {errors.linkUrl?.message}
          </small>
        </div>

        {/* 이미지 */}
        <div className="flex flex-col gap-2">
          <span className="px-1 text-sm font-semibold text-slate-700 sm:text-base">이미지</span>
          <ImageInput onFileChange={setImageFile} initialUrl={fileUrl} onInitialUrlRemove={() => setFileUrl(null)} />
          <p className="text-sm font-medium text-slate-400">이미지는 최대 1개만 첨부할 수 있습니다.</p>
        </div>
      </form>
      <div className="mt-10 flex w-full shrink-0 items-center gap-2 sm:gap-3 [&>*]:flex-1">
        <Button variant="tertiary" size="small" className="py-3 text-base sm:py-[14px] sm:text-lg" onClick={onClose}>
          취소
        </Button>
        <Button
          variant="primary"
          size="small"
          className="py-3 text-base sm:py-[14px] sm:text-lg"
          onClick={handleSubmit_}
          disabled={(disableSubmitUntilValid && !canSubmit) || submitting}
        >
          {submitLabel}
        </Button>
      </div>
    </>
  );
}
