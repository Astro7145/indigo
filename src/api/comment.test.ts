jest.mock('@/src/api/axiosInstance');
import instance from '@/src/api/axiosInstance';
import {
  getComments,
  createComment,
  patchComment,
  deleteComment,
  likeComment,
  unlikeComment,
  commentKeys,
} from '@/src/api/comment';

const mocked = instance as jest.Mocked<typeof instance>;
beforeEach(() => {
  jest.resetAllMocks();
  mocked.get.mockResolvedValue({ data: { comments: [], nextCursor: null, totalCount: 0 } } as never);
  mocked.post.mockResolvedValue({ data: { id: 1 } } as never);
  mocked.patch.mockResolvedValue({ data: { id: 1 } } as never);
  mocked.delete.mockResolvedValue({ data: undefined } as never);
});

it('getComments는 params와 함께 GET /posts/:id/comments를 호출한다', async () => {
  await getComments(2, { parentId: '5' });
  expect(mocked.get).toHaveBeenCalledWith('/posts/2/comments', { params: { parentId: '5' } });
});
it('createComment는 /posts/:id/comments로 POST한다', async () => {
  await createComment(2, { content: 'hi' });
  expect(mocked.post).toHaveBeenCalledWith('/posts/2/comments', { content: 'hi' });
});
it('patchComment는 /posts/:id/comments/:cid로 PATCH한다', async () => {
  await patchComment(2, 8, { content: 'edit' });
  expect(mocked.patch).toHaveBeenCalledWith('/posts/2/comments/8', { content: 'edit' });
});
it('deleteComment는 /posts/:id/comments/:cid로 DELETE한다', async () => {
  await deleteComment(2, 8);
  expect(mocked.delete).toHaveBeenCalledWith('/posts/2/comments/8');
});
it('likeComment는 likes 하위 경로로 POST한다', async () => {
  await likeComment(2, 8);
  expect(mocked.post).toHaveBeenCalledWith('/posts/2/comments/8/likes');
});
it('unlikeComment는 likes 하위 경로로 DELETE한다', async () => {
  await unlikeComment(2, 8);
  expect(mocked.delete).toHaveBeenCalledWith('/posts/2/comments/8/likes');
});
it('commentKeys 팩토리는 안정적인 키를 생성한다', () => {
  expect(commentKeys.lists(2)).toEqual(['post', 'detail', 2, 'comments']);
  expect(commentKeys.list(2, { parentId: '5' })).toEqual(['post', 'detail', 2, 'comments', { parentId: '5' }]);
});
