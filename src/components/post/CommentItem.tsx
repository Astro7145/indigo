'use client';

import { useState, type FormEvent, type KeyboardEvent } from 'react';
import Image from 'next/image';

import Button from '@/src/components/common/buttons/Button';
import IconButton from '@/src/components/common/buttons/IconButton';
import Dropdown from '@/src/components/common/dropdown/Dropdown';
import { IcMeetballs } from '@/src/components/common/icons/IcMeetballs';
import { IcProfileYellow } from '@/src/components/common/icons/IcProfileYellow';
import { IcThumbUp } from '@/src/components/common/icons/IcThumbUp';
import Modal from '@/src/components/common/modal/Modal';
import { useComments, useDeleteComment, useLikeComment, useUnlikeComment, useUpdateComment } from '@/src/hooks/comment';
import { useToast } from '@/src/hooks/useToast';
import type { Comment } from '@/src/types/comment';
import { cn } from '@/src/utils/cn';

import CommentInput from './CommentInput';

interface CommentItemProps {
  comment: Comment;
  postId: number;
  isMine?: boolean;
  // 자식(대댓글)의 isMine 계산용으로 상위에서 주입 — 각 아이템이 useMe()를 따로 구독하지 않게 함
  currentUserId?: number;
  // 자식(대댓글) 렌더 여부. true면 답글 보기/달기 UI 숨겨서 깊이 1단계로 제한
  isReply?: boolean;
  repliesOpen?: boolean;
  onRepliesOpenChange?: (open: boolean) => void;
  onReplyClick?: (commentId: number) => void;
  // 상위가 보유한 "현재 답글 작성 중 대상 댓글 id". 자기 id와 같으면 답글 입력창을 인라인 렌더하고 "답글 달기" 버튼 강조
  activeReplyTargetId?: number | null;
  // 답글 입력창의 onSubmit — 상위에서 createComment + 성공 시 부모 답글 펼침까지 처리
  onReplySubmit?: (content: string, clearInput: () => void) => void;
  // 답글 등록 진행 중이면 답글 입력창을 잠가 중복 제출 방지
  isReplySubmitting?: boolean;
}

export default function CommentItem({
  comment,
  postId,
  isMine = false,
  currentUserId,
  isReply = false,
  repliesOpen = false,
  onRepliesOpenChange,
  onReplyClick,
  activeReplyTargetId = null,
  onReplySubmit,
  isReplySubmitting = false,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { mutate: updateComment, isPending: isUpdating } = useUpdateComment(postId);
  const { mutate: deleteComment } = useDeleteComment(postId);
  const { mutate: likeComment } = useLikeComment(postId);
  const { mutate: unlikeComment } = useUnlikeComment(postId);
  const { showToast } = useToast();
  // 자식 댓글 페치 — repliesOpen일 때만 활성화. postId=undefined면 useComments는 skipToken 처리
  const { data: replies } = useComments(repliesOpen ? postId : undefined, {
    parentId: String(comment.id),
    limit: 20,
  });

  // 현재 isLiked 상태에 따라 like/unlike로 분기. 즉시 토글은 훅의 onMutate에서 처리
  const handleLikeToggle = () => {
    if (comment.isLiked) {
      unlikeComment(comment.id, { onError: () => showToast('좋아요 취소에 실패했어요.', 'error') });
    } else {
      likeComment(comment.id, { onError: () => showToast('좋아요에 실패했어요.', 'error') });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDraft(comment.content);
  };

  const handleSave = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateComment(
      { commentId: comment.id, body: { content: draft } },
      {
        onSuccess: () => setIsEditing(false),
        onError: () => showToast('댓글 수정에 실패했어요.', 'error'),
      },
    );
  };

  // 데스크탑(xl: 1280px+)에서만 Enter→submit / Shift+Enter→개행. 태블릿·모바일은 Enter도 개행이라 수정 버튼으로만 제출.
  // IME 조합 중 Enter는 한글 확정용이므로 모든 환경에서 무시.
  const handleEditKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter' || e.shiftKey || e.nativeEvent.isComposing) return;
    if (!window.matchMedia('(min-width: 1280px)').matches) return;
    e.preventDefault();
    if (draft.trim().length > 0 && !isUpdating) e.currentTarget.form?.requestSubmit();
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
              <Image
                src={comment.writer.image}
                alt=""
                width={24}
                height={24}
                className="size-6 shrink-0 rounded-full object-cover"
              />
            ) : (
              <IcProfileYellow className="size-5 sm:size-6" />
            )}
            <span className="text-sm text-slate-700 sm:text-base">{comment.writer.name}</span>
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
            <textarea
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleEditKeyDown}
              aria-label="댓글 수정"
              disabled={isUpdating}
              className="field-sizing-content w-full resize-none rounded border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none disabled:opacity-50 sm:px-4 sm:py-2.5"
            />
            {/* 시안(21209:60822) — 날짜는 취소/수정 버튼과 같은 줄(좌측)에 둔다 */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-400">{formattedDate}</span>
              <div className="flex gap-2">
                <Button type="button" size="small" variant="tertiary" onClick={handleCancel}>
                  취소
                </Button>
                <Button type="submit" size="small" disabled={draft.trim().length === 0 || isUpdating}>
                  수정
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <>
            <p className="text-sm whitespace-pre-wrap text-slate-700 sm:text-base">{comment.content}</p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>{formattedDate}</span>
              <button
                type="button"
                onClick={handleLikeToggle}
                aria-pressed={comment.isLiked}
                aria-label={comment.isLiked ? '좋아요 취소' : '좋아요'}
                className="flex cursor-pointer items-center gap-1"
              >
                <IcThumbUp
                  filled={comment.isLiked}
                  className={cn('size-4', comment.isLiked ? 'text-indigo-500' : 'text-slate-400')}
                />
                <span>{comment.likeCount}</span>
              </button>
              {/* 자식(대댓글)에는 답글 달기/보기 미노출 — 깊이 1단계 제한 */}
              {!isReply && (
                <>
                  <button
                    type="button"
                    onClick={() => onReplyClick?.(comment.id)}
                    className={cn(
                      'cursor-pointer transition-colors focus-visible:outline-none active:text-indigo-500',
                      activeReplyTargetId === comment.id && 'font-semibold text-indigo-500',
                    )}
                  >
                    답글 달기
                  </button>
                  {comment.replyCount != null && comment.replyCount > 0 && (
                    <button
                      type="button"
                      onClick={() => onRepliesOpenChange?.(!repliesOpen)}
                      className={cn(
                        'cursor-pointer transition-colors focus-visible:outline-none active:text-indigo-500',
                        repliesOpen && 'font-semibold text-indigo-500',
                      )}
                    >
                      {repliesOpen ? '답글 숨기기' : `답글 ${comment.replyCount}개 보기`}
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {!isReply && activeReplyTargetId === comment.id && (
          <div className="mt-3">
            <CommentInput
              autoFocus
              placeholder="답글을 입력해주세요."
              ariaLabel="답글 입력"
              onSubmit={onReplySubmit}
              disabled={isReplySubmitting}
            />
          </div>
        )}

        {!isReply && repliesOpen && (
          <div className="mt-3 border-l-2 border-slate-200 pl-4">
            {!replies ? (
              <p className="text-xs text-slate-400">답글을 불러오는 중…</p>
            ) : (
              <ul className="space-y-3">
                {replies.comments.map((reply) => (
                  <li key={reply.id}>
                    <CommentItem
                      comment={reply}
                      postId={postId}
                      currentUserId={currentUserId}
                      isMine={reply.userId === currentUserId}
                      isReply
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
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
              deleteComment(comment.id, { onError: () => showToast('댓글 삭제에 실패했어요.', 'error') });
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
