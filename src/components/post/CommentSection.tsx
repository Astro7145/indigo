'use client';

import { useState } from 'react';

import { IcPlus } from '@/src/components/common/icons';
import { useCreateComment } from '@/src/hooks/comment';
import { useToast } from '@/src/hooks/useToast';
import type { Comment } from '@/src/types/comment';

import CommentInput from './CommentInput';
import CommentItem from './CommentItem';

interface CommentSectionProps {
  postId: number;
  comments: Comment[];
  // post.commentCount(부모+답글 전체)와 일관되게 헤더 카운트로 사용
  totalCount: number;
  currentUserId: number | undefined;
  // useInfiniteQuery에서 끌어온 페이지네이션 신호
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
}

// "이전 댓글 보기" 버튼 문구의 N. API 기본 limit과 일치 (현재 10)
const COMMENT_PAGE_SIZE = 10;

export default function CommentSection({
  postId,
  comments,
  totalCount,
  currentUserId,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}: CommentSectionProps) {
  const { mutate: createComment, isPending: isCreating } = useCreateComment(postId);
  const { showToast } = useToast();
  // 댓글 id → 답글 영역 펼침 여부. 각 CommentItem이 자기 상태를 들지 않고 상위에서 통합 관리
  const [openReplies, setOpenReplies] = useState<Record<number, boolean>>({});
  // 현재 답글 작성 중인 대상 댓글 id. null이면 답글 작성 모드 아님
  const [replyTargetId, setReplyTargetId] = useState<number | null>(null);

  // clearInput은 CommentInput이 전달하는 콜백 — 등록 성공 시점에만 호출해 입력값을 보존(실패 시 재시도 가능)
  const handleTopLevelSubmit = (content: string, clearInput: () => void) => {
    createComment(
      { content },
      {
        onSuccess: () => clearInput(),
        onError: () => showToast('댓글 등록에 실패했어요.', 'error'),
      },
    );
  };

  const handleReplySubmit = (content: string, clearInput: () => void) => {
    if (replyTargetId == null) return;
    const parentId = replyTargetId;
    createComment(
      { content, parentId },
      {
        onSuccess: () => {
          // 답글 등록 직후 그 부모의 자식 영역 자동 펼침 — 등록 결과를 즉시 확인
          setOpenReplies((prev) => ({ ...prev, [parentId]: true }));
          setReplyTargetId(null);
          clearInput();
        },
        onError: () => showToast('답글 등록에 실패했어요.', 'error'),
      },
    );
  };

  // "답글 달기" 토글 — 같은 댓글이면 취소, 다르면 그 댓글로 전환
  const handleReplyClick = (commentId: number) => {
    setReplyTargetId((prev) => (prev === commentId ? null : commentId));
  };

  return (
    <section className="mt-6">
      <h2 className="mb-4 text-base font-semibold text-slate-800 sm:text-lg">
        댓글 <span className="text-indigo-500">{totalCount}</span>
      </h2>
      <CommentInput onSubmit={handleTopLevelSubmit} disabled={isCreating} />
      {/* 작성순(오래된 것이 위) 정렬이라 다음 페이지가 위에 누적된다. 시선·데이터 추가 위치를 맞추려고 버튼을 목록 위에 둠 */}
      {hasNextPage && (
        <button
          type="button"
          onClick={() => fetchNextPage?.()}
          disabled={isFetchingNextPage}
          className="mt-6 flex w-full cursor-pointer items-center justify-between rounded border border-slate-300 bg-indigo-100 px-4 py-2.5 text-xs text-slate-600 transition-colors hover:bg-indigo-200 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3 sm:text-sm"
        >
          <span>{isFetchingNextPage ? '불러오는 중…' : `${COMMENT_PAGE_SIZE}개 댓글 더 불러오기`}</span>
          <IcPlus className="size-4 text-slate-600 sm:size-6" />
        </button>
      )}
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
                currentUserId={currentUserId}
                isMine={c.userId === currentUserId}
                repliesOpen={!!openReplies[c.id]}
                onRepliesOpenChange={(open) => setOpenReplies((prev) => ({ ...prev, [c.id]: open }))}
                onReplyClick={handleReplyClick}
                activeReplyTargetId={replyTargetId}
                onReplySubmit={handleReplySubmit}
                isReplySubmitting={isCreating}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
