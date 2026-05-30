jest.mock('@/src/api/comment', () => ({
  ...jest.requireActual('@/src/api/comment'),
  deleteComment: jest.fn(),
  patchComment: jest.fn(),
}));

import { fireEvent, screen, waitFor } from '@testing-library/react';

import { deleteComment } from '@/src/api/comment';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';
import type { Comment } from '@/src/types/comment';

import CommentItem from './CommentItem';

beforeEach(() => jest.clearAllMocks());

const baseComment: Comment = {
  id: 1,
  teamId: 't',
  userId: 10,
  postId: 1,
  parentId: null,
  content: '오후엔 집중력이 떨어져서',
  likeCount: 0,
  isLiked: false,
  createdAt: '2026-05-22T00:00:00Z',
  updatedAt: '2026-05-22T00:00:00Z',
  writer: { id: 10, name: '고양이', image: null },
};

it('isMine=false면 "내 댓글" 칩이 보이지 않는다', () => {
  renderWithClient(<CommentItem comment={baseComment} postId={baseComment.postId} isMine={false} />);
  expect(screen.queryByText('내 댓글')).not.toBeInTheDocument();
});

it('isMine=true면 "내 댓글" 칩이 보인다', () => {
  renderWithClient(<CommentItem comment={baseComment} postId={baseComment.postId} isMine={true} />);
  expect(screen.getByText('내 댓글')).toBeInTheDocument();
});

it('더보기 → 수정하기 선택 시 본문이 input으로 바뀌고 취소/수정 버튼이 노출된다', () => {
  renderWithClient(<CommentItem comment={baseComment} postId={baseComment.postId} isMine={true} />);
  fireEvent.click(screen.getByRole('button', { name: /더보기/ }));
  fireEvent.click(screen.getByRole('menuitem', { name: '수정하기' }));

  expect(screen.getByDisplayValue(baseComment.content)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument();
});

it('취소 클릭 시 본문 텍스트로 돌아가고 input/버튼이 사라진다', () => {
  renderWithClient(<CommentItem comment={baseComment} postId={baseComment.postId} isMine={true} />);
  fireEvent.click(screen.getByRole('button', { name: /더보기/ }));
  fireEvent.click(screen.getByRole('menuitem', { name: '수정하기' }));
  fireEvent.click(screen.getByRole('button', { name: '취소' }));

  expect(screen.queryByDisplayValue(baseComment.content)).not.toBeInTheDocument();
  expect(screen.getByText(baseComment.content)).toBeInTheDocument();
});

it('더보기 → 삭제하기 선택 시 확인 모달이 열린다 (즉시 삭제되지 않음)', () => {
  renderWithClient(<CommentItem comment={baseComment} postId={baseComment.postId} isMine={true} />);
  fireEvent.click(screen.getByRole('button', { name: /더보기/ }));
  fireEvent.click(screen.getByRole('menuitem', { name: '삭제하기' }));

  expect(screen.getByRole('heading', { name: '댓글을 삭제하시겠어요?' })).toBeInTheDocument();
  expect(deleteComment).not.toHaveBeenCalled();
});

it('확인 모달에서 취소 시 deleteComment가 호출되지 않는다', () => {
  renderWithClient(<CommentItem comment={baseComment} postId={baseComment.postId} isMine={true} />);
  fireEvent.click(screen.getByRole('button', { name: /더보기/ }));
  fireEvent.click(screen.getByRole('menuitem', { name: '삭제하기' }));
  // 모달의 취소 버튼 — 모달이 열린 뒤 새로 생긴 '취소' 버튼을 찾는다
  fireEvent.click(screen.getByRole('button', { name: '취소' }));

  expect(deleteComment).not.toHaveBeenCalled();
});

it('확인 모달에서 삭제하기 클릭 시 deleteComment(postId, id)를 호출한다', async () => {
  (deleteComment as jest.Mock).mockResolvedValue(undefined);
  renderWithClient(<CommentItem comment={baseComment} postId={baseComment.postId} isMine={true} />);
  fireEvent.click(screen.getByRole('button', { name: /더보기/ }));
  fireEvent.click(screen.getByRole('menuitem', { name: '삭제하기' }));
  // 메뉴 항목이 사라진 뒤 남은 '삭제하기' 버튼이 모달의 confirm
  fireEvent.click(screen.getByRole('button', { name: '삭제하기' }));

  await waitFor(() => expect(deleteComment).toHaveBeenCalledWith(baseComment.postId, baseComment.id));
});
