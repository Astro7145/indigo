'use client';

import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';

import Button from '@/src/components/common/buttons/Button';

interface CommentInputProps {
  onSubmit?: (text: string) => void;
}

export default function CommentInput({ onSubmit }: CommentInputProps) {
  const [text, setText] = useState('');
  const isEmpty = text.trim().length === 0;
  const t = useTranslations('posts');

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
        placeholder={t('comment.placeholder')}
        aria-label={t('comment.inputLabel')}
        className="h-10 w-[235px] rounded border border-slate-200 px-3 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none sm:h-12 sm:w-[480px] sm:px-4 sm:text-base xl:w-[560px]"
      />
      <Button type="submit" size="small" disabled={isEmpty} className="h-10 w-[64px] px-0 sm:h-12 sm:w-[80px]">
        {t('comment.submit')}
      </Button>
    </form>
  );
}
