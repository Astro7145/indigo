import { render, screen, fireEvent } from '@testing-library/react';

import type { Comment } from '@/src/types/comment';

import CommentItem from './CommentItem';

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
  render(<CommentItem comment={baseComment} isMine={false} />);
  expect(screen.queryByText('내 댓글')).not.toBeInTheDocument();
});

it('isMine=true면 "내 댓글" 칩이 보인다', () => {
  render(<CommentItem comment={baseComment} isMine={true} />);
  expect(screen.getByText('내 댓글')).toBeInTheDocument();
});

// NOTE: 공통 Dropdown 머지 전이라 placeholder 트리거(더보기 클릭)가 곧장 수정 모드 진입.
// 머지 후엔 더보기 → "수정하기" 메뉴 선택 흐름으로 복원해야 한다.
it('더보기 클릭 시 본문이 input으로 바뀌고 취소/수정 버튼이 노출된다', () => {
  render(<CommentItem comment={baseComment} isMine={true} />);
  fireEvent.click(screen.getByRole('button', { name: /더보기/ }));

  expect(screen.getByDisplayValue(baseComment.content)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument();
});

it('취소 클릭 시 본문 텍스트로 돌아가고 input/버튼이 사라진다', () => {
  render(<CommentItem comment={baseComment} isMine={true} />);
  fireEvent.click(screen.getByRole('button', { name: /더보기/ }));
  fireEvent.click(screen.getByRole('button', { name: '취소' }));

  expect(screen.queryByDisplayValue(baseComment.content)).not.toBeInTheDocument();
  expect(screen.getByText(baseComment.content)).toBeInTheDocument();
});
