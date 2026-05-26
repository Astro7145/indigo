jest.mock('@/src/api/comment', () => ({
  ...jest.requireActual('@/src/api/comment'),
  getComments: jest.fn(),
  createComment: jest.fn(),
  patchComment: jest.fn(),
  deleteComment: jest.fn(),
  likeComment: jest.fn(),
  unlikeComment: jest.fn(),
}));
import * as commentApi from '@/src/api/comment';
import { postKeys } from '@/src/api/post';
import { waitFor } from '@testing-library/react';
import { renderHookWithClient } from '@/src/hooks/__tests__/test-utils';
import {
  useComments,
  useInfiniteComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  useLikeComment,
  useUnlikeComment,
} from '@/src/hooks/comment';

const mocked = commentApi as jest.Mocked<typeof commentApi>;

beforeEach(() => {
  jest.resetAllMocks();
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

it('useCreateComment(postId)는 게시글 상세(댓글 포함)와 목록을 무효화한다', async () => {
  mocked.createComment.mockResolvedValue({ id: 1 } as never);
  const { result, client } = renderHookWithClient(() => useCreateComment(5));
  const inv = jest.spyOn(client, 'invalidateQueries');
  await result.current.mutateAsync({ content: 'hi' });
  expect(mocked.createComment).toHaveBeenCalledWith(5, { content: 'hi' });
  // detail 무효화가 commentKeys(prefix 하위)도 함께 잡으므로 별도 검증 불필요.
  expect(inv).toHaveBeenCalledWith({ queryKey: postKeys.detail(5) });
  expect(inv).toHaveBeenCalledWith({ queryKey: postKeys.lists() });
});

it('useUpdateComment(postId)는 patchComment를 호출하고 comments prefix를 무효화한다', async () => {
  mocked.patchComment.mockResolvedValue({ id: 9 } as never);
  const { result, client } = renderHookWithClient(() => useUpdateComment(5));
  const inv = jest.spyOn(client, 'invalidateQueries');
  await result.current.mutateAsync({ commentId: 9, body: { content: 'x' } });
  expect(mocked.patchComment).toHaveBeenCalledWith(5, 9, { content: 'x' });
  expect(inv).toHaveBeenCalledWith({ queryKey: commentApi.commentKeys.lists(5) });
});

it('useDeleteComment(postId)는 게시글 상세(댓글 포함)와 목록을 무효화한다', async () => {
  mocked.deleteComment.mockResolvedValue(undefined as never);
  const { result, client } = renderHookWithClient(() => useDeleteComment(5));
  const inv = jest.spyOn(client, 'invalidateQueries');
  await result.current.mutateAsync(9);
  expect(mocked.deleteComment).toHaveBeenCalledWith(5, 9);
  // detail 무효화가 commentKeys(prefix 하위)도 함께 잡으므로 별도 검증 불필요.
  expect(inv).toHaveBeenCalledWith({ queryKey: postKeys.detail(5) });
  expect(inv).toHaveBeenCalledWith({ queryKey: postKeys.lists() });
});

it('useLikeComment(postId)는 likeComment를 호출하고 comments prefix를 무효화한다', async () => {
  mocked.likeComment.mockResolvedValue({ isLiked: true, likeCount: 1 } as never);
  const { result, client } = renderHookWithClient(() => useLikeComment(5));
  const inv = jest.spyOn(client, 'invalidateQueries');
  await result.current.mutateAsync(9);
  expect(mocked.likeComment).toHaveBeenCalledWith(5, 9);
  expect(inv).toHaveBeenCalledWith({ queryKey: commentApi.commentKeys.lists(5) });
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
  expect(inv).toHaveBeenCalledWith({ queryKey: commentApi.commentKeys.lists(5) });
});
