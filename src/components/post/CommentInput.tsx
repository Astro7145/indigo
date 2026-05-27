'use client';

import { useState } from 'react';

import Button from '@/src/components/common/buttons/Button';

interface CommentInputProps {
  onSubmit?: (text: string) => void;
}

export default function CommentInput({ onSubmit }: CommentInputProps) {
  const [text, setText] = useState('');
  const isEmpty = text.trim().length === 0;

  const handleSubmit = () => {
    if (isEmpty) return;
    onSubmit?.(text);
    setText('');
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="댓글을 입력해주세요."
        aria-label="댓글 입력"
        className="flex-1 rounded border border-slate-200 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none md:px-4 md:py-2.5"
      />
      <Button type="button" size="medium" disabled={isEmpty} onClick={handleSubmit}>
        등록
      </Button>
    </div>
  );
}
