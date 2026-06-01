'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';

import Button from '@/src/components/common/buttons/Button';
import IconButton from '@/src/components/common/buttons/IconButton';
import Dropdown from '@/src/components/common/dropdown/Dropdown';
import { IcMeetballs } from '@/src/components/common/icons/IcMeetballs';
import { IcProfileYellow } from '@/src/components/common/icons/IcProfileYellow';
import Modal from '@/src/components/common/modal/Modal';
import { useDeleteComment, useUpdateComment } from '@/src/hooks/comment';
import type { Comment } from '@/src/types/comment';

interface CommentItemProps {
  comment: Comment;
  postId: number;
  isMine?: boolean;
}

export default function CommentItem({ comment, postId, isMine = false }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { mutate: updateComment } = useUpdateComment(postId);
  const { mutate: deleteComment } = useDeleteComment(postId);

  const handleCancel = () => {
    setIsEditing(false);
    setDraft(comment.content);
  };

  const handleSave = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateComment({ commentId: comment.id, body: { content: draft } }, { onSuccess: () => setIsEditing(false) });
  };

  // 수정 진입 시 현재 댓글 내용으로 draft를 동기화 (mount 이후 외부에서 comment가 갱신된 경우 대비)
  const handleStartEdit = () => {
    setDraft(comment.content);
    setIsEditing(true);
  };

  const formattedDate = comment.createdAt.slice(0, 10).replace(/-/g, '.');

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {comment.writer.image ? (
              <Image src={comment.writer.image} alt="" width={24} height={24} className="shrink-0 rounded-full" />
            ) : (
              <IcProfileYellow className="size-5 md:size-6" />
            )}
            <span className="text-sm text-slate-700 md:text-base">{comment.writer.name}</span>
            {isMine && (
              <span className="border-badge-yellow-border bg-badge-yellow-bg text-badge-yellow-text rounded-full border px-2 py-1 text-xs font-medium">
                내 댓글
              </span>
            )}
          </div>
          {isMine && (
            <Dropdown className="shrink-0">
              <Dropdown.Trigger asChild>
                <IconButton aria-label="더보기">
                  <IcMeetballs className="size-5 text-slate-400" />
                </IconButton>
              </Dropdown.Trigger>
              <Dropdown.Menu placement="bottom-end" size="small">
                <Dropdown.Item onClick={handleStartEdit}>수정하기</Dropdown.Item>
                <Dropdown.Item onClick={() => setDeleteOpen(true)} className="text-destructive">
                  삭제하기
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="댓글 수정"
              className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none md:px-4 md:py-2.5"
            />
            {/* 시안(21209:60822) — 날짜는 취소/수정 버튼과 같은 줄(좌측)에 둔다 */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-400">{formattedDate}</span>
              <div className="flex gap-2">
                <Button type="button" size="small" variant="tertiary" onClick={handleCancel}>
                  취소
                </Button>
                <Button type="submit" size="small" disabled={draft.trim().length === 0}>
                  수정
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <>
            <p className="text-sm text-slate-700 md:text-base">{comment.content}</p>
            <div className="text-xs text-slate-400">{formattedDate}</div>
          </>
        )}
      </div>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <div className="mb-6 text-center sm:mb-10">
          <Modal.Title>댓글을 삭제하시겠어요?</Modal.Title>
        </div>
        <Modal.Actions>
          <Modal.Cancel>취소</Modal.Cancel>
          <Modal.Confirm
            onClick={() => {
              deleteComment(comment.id);
              setDeleteOpen(false);
            }}
          >
            삭제하기
          </Modal.Confirm>
        </Modal.Actions>
      </Modal>
    </>
  );
}
