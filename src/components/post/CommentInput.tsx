'use client';

import { useState, type FormEvent } from 'react';

import Button from '@/src/components/common/buttons/Button';

interface CommentInputProps {
  onSubmit?: (text: string) => void;
}

export default function CommentInput({ onSubmit }: CommentInputProps) {
  const [text, setText] = useState('');
  const isEmpty = text.trim().length === 0;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isEmpty) return;
    onSubmit?.(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="댓글을 입력해주세요."
        aria-label="댓글 입력"
        className="h-10 w-[235px] rounded border border-slate-200 px-3 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none md:h-12 md:w-[480px] md:px-4 md:text-base xl:w-[560px]"
      />
      <Button type="submit" size="small" disabled={isEmpty} className="h-10 w-[64px] px-0 md:h-12 md:w-[80px]">
        등록
      </Button>
    </form>
  );
}
