'use client';

import { useState, type FormEvent, type KeyboardEvent } from 'react';

import Button from '@/src/components/common/buttons/Button';

interface CommentInputProps {
  // 등록 성공/실패는 상위가 알기에, 비움 타이밍을 상위가 결정하도록 clearInput 콜백을 함께 전달한다
  onSubmit?: (text: string, clearInput: () => void) => void;
  placeholder?: string;
  ariaLabel?: string;
  // 답글 입력창처럼 사용자가 명시적으로 연 입력에 즉시 포커스시킬 때 사용
  autoFocus?: boolean;
  // 등록 진행 중 등 외부에서 입력을 잠가야 할 때 사용 (중복 제출 방지)
  disabled?: boolean;
}

export default function CommentInput({
  onSubmit,
  placeholder = '댓글을 입력해주세요.',
  ariaLabel = '댓글 입력',
  autoFocus = false,
  disabled = false,
}: CommentInputProps) {
  const [text, setText] = useState('');
  const isEmpty = text.trim().length === 0;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isEmpty || disabled) return;
    onSubmit?.(text, () => setText(''));
  };

  // Enter → submit, Shift+Enter → 개행. IME 조합 중에는 Enter가 한글 확정용이므로 submit 무시
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter' || e.shiftKey || e.nativeEvent.isComposing) return;
    e.preventDefault();
    if (!isEmpty && !disabled) e.currentTarget.form?.requestSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-end gap-2">
      <textarea
        autoFocus={autoFocus}
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={ariaLabel}
        disabled={disabled}
        // field-sizing-content: 입력 높이가 내용에 맞춰 자동 증가 (Chrome 123+, Safari 17.4+, Firefox 미지원은 1줄 고정 + 내부 스크롤)
        className="field-sizing-content min-h-10 w-full min-w-0 flex-1 resize-none rounded border border-slate-200 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none disabled:opacity-50 sm:min-h-12 sm:px-4 sm:py-3 sm:text-base"
      />
      <Button
        type="submit"
        size="small"
        disabled={isEmpty || disabled}
        className="h-10 w-[64px] shrink-0 px-0 sm:h-12 sm:w-[80px]"
      >
        등록
      </Button>
    </form>
  );
}
