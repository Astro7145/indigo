jest.mock('@/src/api/comment', () => ({
  ...jest.requireActual('@/src/api/comment'),
  createComment: jest.fn(),
}));

import { fireEvent, screen, waitFor } from '@testing-library/react';

import { createComment } from '@/src/api/comment';
import CommentSection from '@/src/components/post/CommentSection';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';
import type { Comment } from '@/src/types/comment';

const makeComment = (id: number, userId: number, content: string): Comment => ({
  id,
  teamId: 't',
  userId,
  postId: 1,
  parentId: null,
  content,
  likeCount: 0,
  isLiked: false,
  createdAt: '2026-05-22T00:00:00Z',
  updatedAt: '2026-05-22T00:00:00Z',
  writer: { id: userId, name: '작성자', image: null },
});

beforeEach(() => jest.clearAllMocks());

it('댓글 개수와 목록을 렌더한다', () => {
  renderWithClient(
    <CommentSection
      postId={1}
      comments={[makeComment(1, 11, '첫 댓글'), makeComment(2, 12, '둘째 댓글')]}
      totalCount={2}
      currentUserId={10}
    />,
  );
  expect(screen.getByRole('heading', { name: '댓글 2' })).toBeInTheDocument();
  expect(screen.getByText('첫 댓글')).toBeInTheDocument();
  expect(screen.getByText('둘째 댓글')).toBeInTheDocument();
});

it('댓글이 없으면 빈 안내를 렌더한다', () => {
  renderWithClient(<CommentSection postId={1} comments={[]} totalCount={0} currentUserId={10} />);
  expect(screen.getByText('아직 댓글이 없어요. 첫 댓글을 남겨보세요!')).toBeInTheDocument();
});

it('입력 후 등록 시 createComment(postId, body)를 호출한다', async () => {
  (createComment as jest.Mock).mockResolvedValue(makeComment(3, 10, '새 댓글'));
  renderWithClient(<CommentSection postId={1} comments={[]} totalCount={0} currentUserId={10} />);
  fireEvent.change(screen.getByLabelText('댓글 입력'), { target: { value: '새 댓글' } });
  fireEvent.click(screen.getByRole('button', { name: '등록' }));

  await waitFor(() => expect(createComment).toHaveBeenCalledWith(1, { content: '새 댓글' }));
});
