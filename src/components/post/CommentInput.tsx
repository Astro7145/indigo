'use client';

import { useState, type FormEvent, type RefObject } from 'react';

import Button from '@/src/components/common/buttons/Button';
import { IcDelete } from '@/src/components/common/icons';

interface CommentInputProps {
  // 등록 성공/실패는 상위가 알기에, 비움 타이밍을 상위가 결정하도록 clearInput 콜백을 함께 전달한다
  onSubmit?: (text: string, clearInput: () => void) => void;
  // 답글 작성 모드 — 대상 닉네임이 있으면 입력창 위에 배지를 보여주고 placeholder도 답글용으로 바꿈
  replyToName?: string | null;
  onCancelReply?: () => void;
  inputRef?: RefObject<HTMLInputElement | null>;
}

export default function CommentInput({ onSubmit, replyToName, onCancelReply, inputRef }: CommentInputProps) {
  const [text, setText] = useState('');
  const isEmpty = text.trim().length === 0;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isEmpty) return;
    onSubmit?.(text, () => setText(''));
  };

  return (
    <div className="flex w-full flex-col gap-2">
      {replyToName && (
        <div className="flex items-center justify-between rounded bg-slate-50 px-3 py-1.5 text-xs text-slate-600 sm:px-4">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-indigo-500">@{replyToName}</span>
            <span>님에게 답글 작성 중</span>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            aria-label="답글 취소"
            className="flex cursor-pointer items-center justify-center p-0.5 text-slate-400 hover:text-slate-600"
          >
            <IcDelete className="size-3.5" />
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={replyToName ? '답글을 입력해주세요.' : '댓글을 입력해주세요.'}
          aria-label={replyToName ? '답글 입력' : '댓글 입력'}
          className="h-10 w-full min-w-0 flex-1 rounded border border-slate-200 px-3 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none sm:h-12 sm:px-4 sm:text-base"
        />
        <Button
          type="submit"
          size="small"
          disabled={isEmpty}
          className="h-10 w-[64px] shrink-0 px-0 sm:h-12 sm:w-[80px]"
        >
          등록
        </Button>
      </form>
    </div>
  );
}
