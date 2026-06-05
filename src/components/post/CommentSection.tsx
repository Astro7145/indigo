'use client';

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
              <CommentItem comment={c} postId={postId} isMine={c.userId === currentUserId} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
