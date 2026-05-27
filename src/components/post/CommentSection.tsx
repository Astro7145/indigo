import type { Comment } from '@/src/types/comment';

import CommentInput from './CommentInput';
import CommentItem from './CommentItem';

interface CommentSectionProps {
  comments: Comment[];
  currentUserId: number;
}

export default function CommentSection({ comments, currentUserId }: CommentSectionProps) {
  return (
    <section>
      <h2 className="mb-4 text-sm text-slate-700">
        댓글 <span className="text-indigo-500">{comments.length}</span>
      </h2>
      <CommentInput />
      <ul className="mt-6 space-y-4">
        {comments.map((c) => (
          <li key={c.id}>
            <CommentItem comment={c} isMine={c.userId === currentUserId} />
          </li>
        ))}
      </ul>
    </section>
  );
}
