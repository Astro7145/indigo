'use client';

import { useEffect, useRef, useState } from 'react';

import { useCreateComment } from '@/src/hooks/comment';
import { useToast } from '@/src/hooks/useToast';
import type { Comment } from '@/src/types/comment';

import CommentInput from './CommentInput';
import CommentItem from './CommentItem';

interface CommentSectionProps {
  postId: number;
  comments: Comment[];
  currentUserId: number | undefined;
}

export default function CommentSection({ postId, comments, currentUserId }: CommentSectionProps) {
  const { mutate: createComment } = useCreateComment(postId);
  const { showToast } = useToast();
  // 댓글 id → 답글 영역 펼침 여부. 각 CommentItem이 자기 상태를 들지 않고 상위에서 통합 관리
  const [openReplies, setOpenReplies] = useState<Record<number, boolean>>({});
  // 답글 작성 대상. null이면 일반 댓글 작성 모드, 값이 있으면 그 댓글에 답글 작성 모드
  const [replyTarget, setReplyTarget] = useState<{ commentId: number; writerName: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 답글 작성 모드 진입 시 자동 포커스 (사용자가 바로 입력 가능하게)
  useEffect(() => {
    if (replyTarget) inputRef.current?.focus();
  }, [replyTarget]);

  const handleCommentSubmit = (content: string) => {
    if (replyTarget) {
      const parentId = replyTarget.commentId;
      createComment(
        { content, parentId },
        {
          onSuccess: () => {
            // 답글 등록 직후 그 부모의 자식 영역 자동 펼침 — 등록 결과를 즉시 확인
            setOpenReplies((prev) => ({ ...prev, [parentId]: true }));
            setReplyTarget(null);
          },
          onError: () => showToast('답글 등록에 실패했어요.', 'error'),
        },
      );
    } else {
      createComment({ content }, { onError: () => showToast('댓글 등록에 실패했어요.', 'error') });
    }
  };

  // "답글 달기" 토글 — 같은 댓글이면 취소, 다르면 그 댓글로 전환
  const handleReplyClick = (commentId: number, writerName: string) => {
    setReplyTarget((prev) => (prev?.commentId === commentId ? null : { commentId, writerName }));
  };

  return (
    <section className="mt-6">
      <h2 className="mb-4 text-base font-semibold text-slate-800 sm:text-lg">
        댓글 <span className="text-indigo-500">{comments.length}</span>
      </h2>
      <CommentInput
        inputRef={inputRef}
        replyToName={replyTarget?.writerName}
        onCancelReply={() => setReplyTarget(null)}
        onSubmit={handleCommentSubmit}
      />
      {comments.length === 0 ? (
        <div className="mt-6 flex h-20 items-center justify-center">
          <p className="text-sm text-slate-400">아직 댓글이 없어요. 첫 댓글을 남겨보세요!</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {comments.map((c) => (
            <li key={c.id}>
              <CommentItem
                comment={c}
                postId={postId}
                isMine={c.userId === currentUserId}
                repliesOpen={!!openReplies[c.id]}
                onRepliesOpenChange={(open) => setOpenReplies((prev) => ({ ...prev, [c.id]: open }))}
                onReplyClick={handleReplyClick}
                activeReplyTargetId={replyTarget?.commentId ?? null}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
