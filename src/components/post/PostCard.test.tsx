jest.mock('@/src/api/post', () => ({
  ...jest.requireActual('@/src/api/post'),
  getPost: jest.fn(),
}));

import { screen } from '@testing-library/react';

import * as postApi from '@/src/api/post';
import PostCard from '@/src/components/post/PostCard';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';
import type { Post } from '@/src/types/post';

const mocked = postApi as jest.Mocked<typeof postApi>;

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

beforeEach(() => jest.resetAllMocks());

it('로딩 중에는 안내 문구를 보여준다', () => {
  mocked.getPost.mockReturnValue(new Promise(() => {}));
  renderWithClient(<PostCard postId={7} />);
  expect(screen.getByText('불러오는 중…')).toBeInTheDocument();
});

it('postId로 글을 받아 제목과 작성자를 렌더한다', async () => {
  mocked.getPost.mockResolvedValue(post);
  renderWithClient(<PostCard postId={7} />);
  expect(await screen.findByText('게시판 글 제목')).toBeInTheDocument();
  expect(screen.getByText('홍길동')).toBeInTheDocument();
  expect(mocked.getPost).toHaveBeenCalledWith(7);
});

it('에러 시 에러 문구를 보여준다', async () => {
  mocked.getPost.mockRejectedValue(new Error('boom'));
  renderWithClient(<PostCard postId={7} />);
  expect(await screen.findByText('불러오지 못했어요')).toBeInTheDocument();
});
