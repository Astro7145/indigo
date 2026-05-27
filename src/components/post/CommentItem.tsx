'use client';

import { useState } from 'react';

import Button from '@/src/components/common/buttons/Button';
import { IcProfileYellow } from '@/src/components/common/icons/IcProfileYellow';
import PostMoreMenu from '@/src/components/post/PostMoreMenu';
import type { Comment } from '@/src/types/comment';

interface CommentItemProps {
  comment: Comment;
  isMine?: boolean;
}

export default function CommentItem({ comment, isMine = false }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);

  const handleCancel = () => {
    setIsEditing(false);
    setDraft(comment.content);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <IcProfileYellow className="size-5" />
          <span className="text-sm text-slate-700">{comment.writer.name}</span>
          {isMine && <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs text-amber-700">내 댓글</span>}
        </div>
        {isMine && <PostMoreMenu onEdit={() => setIsEditing(true)} onDelete={() => {}} />}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            aria-label="댓글 수정"
            className="w-full rounded border border-slate-200 px-4 py-2.5 text-sm focus:border-slate-400 focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" size="small" variant="tertiary" onClick={handleCancel}>
              취소
            </Button>
            <Button type="button" size="small" onClick={handleSave}>
              수정
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-700">{comment.content}</p>
      )}

      <div className="text-xs text-slate-400">{comment.createdAt.slice(0, 10).replace(/-/g, '.')}</div>
    </div>
  );
}
