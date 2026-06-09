'use client';

import { useState } from 'react';

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

  return (
    <section className="mt-6">
      <h2 className="mb-4 text-base font-semibold text-slate-800 sm:text-lg">
        댓글 <span className="text-indigo-500">{comments.length}</span>
      </h2>
      <CommentInput
        onSubmit={(content) =>
          createComment({ content }, { onError: () => showToast('댓글 등록에 실패했어요.', 'error') })
        }
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
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
