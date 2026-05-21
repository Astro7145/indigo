jest.mock('@/src/api/post', () => ({
  ...jest.requireActual('@/src/api/post'),
  getPosts: jest.fn(),
  getPost: jest.fn(),
  createPost: jest.fn(),
  patchPost: jest.fn(),
  deletePost: jest.fn(),
  getComments: jest.fn(),
  createComment: jest.fn(),
  patchComment: jest.fn(),
  deleteComment: jest.fn(),
  likeComment: jest.fn(),
  unlikeComment: jest.fn(),
}));
import * as postApi from '@/src/api/post';
import { waitFor } from '@testing-library/react';
import { renderHookWithClient } from '@/src/hooks/__tests__/test-utils';
import {
  usePostList,
  useInfinitePostList,
  usePost,
  useComments,
  useInfiniteComments,
  useCreatePost,
  useUpdatePost,
  useDeletePost,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  useLikeComment,
  useUnlikeComment,
  commentsPrefix,
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

it('useComments는 postId가 undefined이면 비활성화된다', () => {
  renderHookWithClient(() => useComments(undefined));
  expect(mocked.getComments).not.toHaveBeenCalled();
});

it('useInfiniteComments는 postId가 undefined이면 비활성화된다', () => {
  renderHookWithClient(() => useInfiniteComments(undefined));
  expect(mocked.getComments).not.toHaveBeenCalled();
});

it('useComments는 postId와 params로 getComments를 호출한다', async () => {
  mocked.getComments.mockResolvedValue({
    comments: [],
    nextCursor: null,
    totalCount: 0,
  } as never);
  const { result } = renderHookWithClient(() => useComments(5, { limit: 10 }));
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(mocked.getComments).toHaveBeenCalledWith(5, { limit: 10 });
});

it('useInfiniteComments는 첫 페이지에서 cursor를 전달한다', async () => {
  mocked.getComments.mockResolvedValueOnce({
    comments: [],
    nextCursor: 'c1',
    totalCount: 0,
  } as never);
  const { result } = renderHookWithClient(() => useInfiniteComments(5, { limit: 10 }));
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(mocked.getComments).toHaveBeenLastCalledWith(5, {
    limit: 10,
    cursor: undefined,
  });
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
  // detail 제거가 commentsPrefix(prefix 하위)도 함께 잡으므로 별도 검증 불필요.
  expect(rm).toHaveBeenCalledWith({ queryKey: postApi.postKeys.detail(5) });
});

it('useCreateComment(postId)는 게시글 상세(댓글 포함)와 목록을 무효화한다', async () => {
  mocked.createComment.mockResolvedValue({ id: 1 } as never);
  const { result, client } = renderHookWithClient(() => useCreateComment(5));
  const inv = jest.spyOn(client, 'invalidateQueries');
  await result.current.mutateAsync({ content: 'hi' });
  expect(mocked.createComment).toHaveBeenCalledWith(5, { content: 'hi' });
  // detail 무효화가 commentsPrefix(prefix 하위)도 함께 잡으므로 별도 검증 불필요.
  expect(inv).toHaveBeenCalledWith({ queryKey: postApi.postKeys.detail(5) });
  expect(inv).toHaveBeenCalledWith({ queryKey: postApi.postKeys.lists() });
});

it('useUpdateComment(postId)는 patchComment를 호출하고 comments prefix를 무효화한다', async () => {
  mocked.patchComment.mockResolvedValue({ id: 9 } as never);
  const { result, client } = renderHookWithClient(() => useUpdateComment(5));
  const inv = jest.spyOn(client, 'invalidateQueries');
  await result.current.mutateAsync({ commentId: 9, body: { content: 'x' } });
  expect(mocked.patchComment).toHaveBeenCalledWith(5, 9, { content: 'x' });
  expect(inv).toHaveBeenCalledWith({ queryKey: commentsPrefix(5) });
});

it('useDeleteComment(postId)는 게시글 상세(댓글 포함)와 목록을 무효화한다', async () => {
  mocked.deleteComment.mockResolvedValue(undefined as never);
  const { result, client } = renderHookWithClient(() => useDeleteComment(5));
  const inv = jest.spyOn(client, 'invalidateQueries');
  await result.current.mutateAsync(9);
  expect(mocked.deleteComment).toHaveBeenCalledWith(5, 9);
  // detail 무효화가 commentsPrefix(prefix 하위)도 함께 잡으므로 별도 검증 불필요.
  expect(inv).toHaveBeenCalledWith({ queryKey: postApi.postKeys.detail(5) });
  expect(inv).toHaveBeenCalledWith({ queryKey: postApi.postKeys.lists() });
});

it('useLikeComment(postId)는 likeComment를 호출하고 comments prefix를 무효화한다', async () => {
  mocked.likeComment.mockResolvedValue({ isLiked: true, likeCount: 1 } as never);
  const { result, client } = renderHookWithClient(() => useLikeComment(5));
  const inv = jest.spyOn(client, 'invalidateQueries');
  await result.current.mutateAsync(9);
  expect(mocked.likeComment).toHaveBeenCalledWith(5, 9);
  expect(inv).toHaveBeenCalledWith({ queryKey: commentsPrefix(5) });
});

it('useUnlikeComment(postId)는 unlikeComment를 호출하고 comments prefix를 무효화한다', async () => {
  mocked.unlikeComment.mockResolvedValue({
    isLiked: false,
    likeCount: 0,
  } as never);
  const { result, client } = renderHookWithClient(() => useUnlikeComment(5));
  const inv = jest.spyOn(client, 'invalidateQueries');
  await result.current.mutateAsync(9);
  expect(mocked.unlikeComment).toHaveBeenCalledWith(5, 9);
  expect(inv).toHaveBeenCalledWith({ queryKey: commentsPrefix(5) });
});
