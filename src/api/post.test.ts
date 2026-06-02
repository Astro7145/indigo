jest.mock('@/src/api/client-fetcher');
import instance from '@/src/api/client-fetcher';
import { getPosts, getPost, createPost, patchPost, deletePost, postKeys } from '@/src/api/post';

const mocked = instance as jest.Mocked<typeof instance>;
beforeEach(() => {
  jest.resetAllMocks();
  mocked.get.mockResolvedValue({ data: { posts: [], nextCursor: null, totalCount: 0 } } as never);
  mocked.post.mockResolvedValue({ data: { id: 1 } } as never);
  mocked.patch.mockResolvedValue({ data: { id: 1 } } as never);
  mocked.delete.mockResolvedValue({ data: undefined } as never);
});

it('getPosts는 params와 함께 GET /posts를 호출한다', async () => {
  const r = await getPosts({ type: 'best', search: 'q' });
  expect(mocked.get).toHaveBeenCalledWith('/posts', { params: { type: 'best', search: 'q' } });
  expect(r).toEqual({ posts: [], nextCursor: null, totalCount: 0 });
});
it('getPost는 GET /posts/:id를 호출한다', async () => {
  await getPost(2);
  expect(mocked.get).toHaveBeenCalledWith('/posts/2');
});
it('createPost는 /posts로 POST한다', async () => {
  await createPost({ title: 't', content: 'c' });
  expect(mocked.post).toHaveBeenCalledWith('/posts', { title: 't', content: 'c' });
});
it('patchPost는 /posts/:id로 PATCH한다', async () => {
  await patchPost(2, { title: 'u' });
  expect(mocked.patch).toHaveBeenCalledWith('/posts/2', { title: 'u' });
});
it('deletePost는 /posts/:id로 DELETE한다', async () => {
  await deletePost(2);
  expect(mocked.delete).toHaveBeenCalledWith('/posts/2');
});
it('postKeys 팩토리는 안정적인 키를 생성한다', () => {
  expect(postKeys.list({ type: 'best' })).toEqual(['post', 'list', { type: 'best' }]);
  expect(postKeys.detail(2)).toEqual(['post', 'detail', 2]);
});
