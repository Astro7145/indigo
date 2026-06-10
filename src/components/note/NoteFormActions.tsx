'use client';

interface NoteFormActionsProps {
  mode: 'create' | 'edit';
  isValid: boolean;
  isSubmitting: boolean;
  onDraft: () => void;
  onSubmit: () => void;
}

// 모바일 Topbar(다크 배경) 우측에 노출되는 노트 작성/수정 액션.
// 폼이 자신의 핸들러·상태를 클로저로 묶어 store에 등록한다.
export default function NoteFormActions({ mode, isValid, isSubmitting, onDraft, onSubmit }: NoteFormActionsProps) {
  const submitText = mode === 'edit' ? '수정' : '등록';
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onDraft}
        disabled={!isValid || isSubmitting}
        className="cursor-pointer px-1.5 py-0.5 text-sm font-medium tracking-[-0.03em] text-indigo-400 disabled:cursor-not-allowed disabled:text-indigo-800"
      >
        임시저장
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={!isValid || isSubmitting}
        className="cursor-pointer px-1.5 py-0.5 text-sm font-semibold tracking-[-0.03em] text-indigo-500 disabled:cursor-not-allowed disabled:text-indigo-800"
      >
        {submitText}
      </button>
    </div>
  );
}
