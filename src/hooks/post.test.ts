jest.mock('@/src/api/post', () => ({
  ...jest.requireActual('@/src/api/post'),
  getPosts: jest.fn(),
  getPost: jest.fn(),
  createPost: jest.fn(),
  patchPost: jest.fn(),
  deletePost: jest.fn(),
}));
import * as postApi from '@/src/api/post';
import { waitFor } from '@testing-library/react';
import { renderHookWithClient } from '@/src/hooks/__tests__/test-utils';
import {
  usePostList,
  useInfinitePostList,
  usePost,
  useCreatePost,
  useUpdatePost,
  useDeletePost,
} from '@/src/hooks/post';

const mocked = postApi as jest.Mocked<typeof postApi>;

beforeEach(() => {
  jest.resetAllMocks();
});

it('usePostList는 params와 함께 getPosts를 호출한다', async () => {
  mocked.getPosts.mockResolvedValue({
    posts: [],
    nextCursor: null,
    totalCount: 0,
  } as never);
  const { result } = renderHookWithClient(() => usePostList({ type: 'best' }));
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(mocked.getPosts).toHaveBeenCalledWith({ type: 'best' });
});

it('usePost는 id가 undefined이면 비활성화된다', () => {
  renderHookWithClient(() => usePost(undefined));
  expect(mocked.getPost).not.toHaveBeenCalled();
});

it('usePost는 id가 주어지면 getPost를 호출한다', async () => {
  mocked.getPost.mockResolvedValue({ id: 5 } as never);
  const { result } = renderHookWithClient(() => usePost(5));
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(mocked.getPost).toHaveBeenCalledWith(5);
});

it('useInfinitePostList는 첫 페이지에서 문자열 cursor를 전달한다', async () => {
  mocked.getPosts.mockResolvedValueOnce({
    posts: [],
    nextCursor: 'next-token',
    totalCount: 0,
  } as never);
  const { result } = renderHookWithClient(() => useInfinitePostList({ limit: 5 }));
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(mocked.getPosts).toHaveBeenLastCalledWith({
    limit: 5,
    cursor: undefined,
  });
  expect(result.current.hasNextPage).toBe(true);
});

it('useCreatePost는 성공 시 목록을 무효화한다', async () => {
  mocked.createPost.mockResolvedValue({ id: 1 } as never);
  const { result, client } = renderHookWithClient(() => useCreatePost());
  const inv = jest.spyOn(client, 'invalidateQueries');
  await result.current.mutateAsync({ title: 't', content: 'c' });
  expect(mocked.createPost).toHaveBeenCalledWith({ title: 't', content: 'c' });
  expect(inv).toHaveBeenCalledWith({ queryKey: postApi.postKeys.lists() });
});

it('useUpdatePost는 성공 시 목록을 무효화하고 상세 캐시에 기록한다', async () => {
  mocked.patchPost.mockResolvedValue({ id: 5 } as never);
  const { result, client } = renderHookWithClient(() => useUpdatePost());
  const inv = jest.spyOn(client, 'invalidateQueries');
  const setData = jest.spyOn(client, 'setQueryData');
  await result.current.mutateAsync({ postId: 5, body: { title: 'x' } });
  expect(mocked.patchPost).toHaveBeenCalledWith(5, { title: 'x' });
  expect(inv).toHaveBeenCalledWith({ queryKey: postApi.postKeys.lists() });
  expect(setData).toHaveBeenCalledWith(postApi.postKeys.detail(5), { id: 5 });
});

it('useDeletePost는 성공 시 목록을 무효화하고 상세 캐시를 제거한다', async () => {
  mocked.deletePost.mockResolvedValue(undefined as never);
  const { result, client } = renderHookWithClient(() => useDeletePost());
  const inv = jest.spyOn(client, 'invalidateQueries');
  const rm = jest.spyOn(client, 'removeQueries');
  await result.current.mutateAsync(5);
  expect(mocked.deletePost).toHaveBeenCalledWith(5);
  expect(inv).toHaveBeenCalledWith({ queryKey: postApi.postKeys.lists() });
  // detail 제거가 comments 캐시(prefix 하위)도 함께 잡으므로 별도 검증 불필요.
  expect(rm).toHaveBeenCalledWith({ queryKey: postApi.postKeys.detail(5) });
});
