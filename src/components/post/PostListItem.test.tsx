import { fireEvent, render, screen } from '@testing-library/react';

import PostListItem from '@/src/components/post/PostListItem';
import type { Post } from '@/src/types/post';

const post: Post = {
  id: 1,
  teamId: 't',
  userId: 1,
  title: '오늘의 회고',
  content: '<p>오전에는 집중이 잘 됐다</p>',
  image: null,
  viewCount: 42,
  createdAt: '2026-05-20T00:00:00Z',
  updatedAt: '2026-05-20T00:00:00Z',
  writer: { id: 1, name: '김수진', image: null },
  commentCount: 3,
};

it('제목과 HTML 태그를 제거한 본문을 렌더한다', () => {
  render(<PostListItem post={post} />);
  expect(screen.getByText('오늘의 회고')).toBeInTheDocument();
  expect(screen.getByText('오전에는 집중이 잘 됐다')).toBeInTheDocument();
});

it('작성자명, 상대 시간, 조회수, 댓글수를 렌더한다', () => {
  jest.useFakeTimers().setSystemTime(new Date('2026-05-30T00:00:00Z'));
  render(<PostListItem post={post} />);
  expect(screen.getByText('김수진')).toBeInTheDocument();
  expect(screen.getByText('2026.05.20')).toBeInTheDocument();
  expect(screen.getByText(/조회 42/)).toBeInTheDocument();
  expect(screen.getByText('3')).toBeInTheDocument();
  jest.useRealTimers();
});

it('image가 null이면 썸네일을 렌더하지 않는다', () => {
  const { container } = render(<PostListItem post={post} />);
  expect(container.querySelector('img')).not.toBeInTheDocument();
});

it('image가 있으면 썸네일을 렌더한다', () => {
  const { container } = render(<PostListItem post={{ ...post, image: 'https://example.com/thumb.png' }} />);
  expect(container.querySelector('img')).toBeInTheDocument();
});

it('클릭 시 onClick이 호출된다', () => {
  const onClick = jest.fn();
  render(<PostListItem post={post} onClick={onClick} />);
  fireEvent.click(screen.getByText('오늘의 회고'));
  expect(onClick).toHaveBeenCalledTimes(1);
});
