import { fireEvent, render, screen } from '@testing-library/react';

import PostCard from '@/src/components/post/PostCard';
import type { Post } from '@/src/types/post';

const post: Post = {
  id: 7,
  teamId: 't',
  userId: 1,
  title: '게시판 글 제목',
  content: '본문',
  image: null,
  viewCount: 128,
  createdAt: '2026-05-20T00:00:00Z',
  updatedAt: '2026-05-20T00:00:00Z',
  writer: { id: 1, name: '홍길동', image: null },
  commentCount: 12,
};

it('제목과 작성자를 렌더한다', () => {
  render(<PostCard post={post} />);
  expect(screen.getByText('게시판 글 제목')).toBeInTheDocument();
  expect(screen.getByText('홍길동')).toBeInTheDocument();
});

it('조회수와 댓글 수를 렌더한다', () => {
  render(<PostCard post={post} />);
  expect(screen.getByText(/조회 128/)).toBeInTheDocument();
  expect(screen.getByLabelText('댓글 12개')).toBeInTheDocument();
});

it('image가 null이면 썸네일을 렌더하지 않는다', () => {
  const { container } = render(<PostCard post={post} />);
  expect(container.querySelector('img')).not.toBeInTheDocument();
});

it('image가 있으면 썸네일을 렌더한다', () => {
  const { container } = render(<PostCard post={{ ...post, image: 'https://example.com/img.png' }} />);
  expect(container.querySelector('img')).toBeInTheDocument();
});

it('onClick이 전달되면 클릭 시 호출된다', () => {
  const onClick = jest.fn();
  render(<PostCard post={post} onClick={onClick} />);
  fireEvent.click(screen.getByText('게시판 글 제목'));
  expect(onClick).toHaveBeenCalledTimes(1);
});
