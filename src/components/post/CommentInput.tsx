'use client';

import { useState, type FormEvent } from 'react';

import Button from '@/src/components/common/buttons/Button';

interface CommentInputProps {
  // 등록 성공/실패는 상위가 알기에, 비움 타이밍을 상위가 결정하도록 clearInput 콜백을 함께 전달한다
  onSubmit?: (text: string, clearInput: () => void) => void;
  placeholder?: string;
  ariaLabel?: string;
  // 답글 입력창처럼 사용자가 명시적으로 연 입력에 즉시 포커스시킬 때 사용
  autoFocus?: boolean;
}

export default function CommentInput({
  onSubmit,
  placeholder = '댓글을 입력해주세요.',
  ariaLabel = '댓글 입력',
  autoFocus = false,
}: CommentInputProps) {
  const [text, setText] = useState('');
  const isEmpty = text.trim().length === 0;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isEmpty) return;
    onSubmit?.(text, () => setText(''));
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
      <input
        autoFocus={autoFocus}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="h-10 w-full min-w-0 flex-1 rounded border border-slate-200 px-3 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none sm:h-12 sm:px-4 sm:text-base"
      />
      <Button type="submit" size="small" disabled={isEmpty} className="h-10 w-[64px] shrink-0 px-0 sm:h-12 sm:w-[80px]">
        등록
      </Button>
    </form>
  );
}
