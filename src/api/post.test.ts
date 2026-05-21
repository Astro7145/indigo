jest.mock('@/src/api/axiosInstance')
import instance from '@/src/api/axiosInstance'
import {
  getPosts, getPost, createPost, patchPost, deletePost,
  getComments, createComment, patchComment, deleteComment,
  likeComment, unlikeComment, postKeys,
} from '@/src/api/post'

const mocked = instance as jest.Mocked<typeof instance>
beforeEach(() => {
  jest.resetAllMocks()
  mocked.get.mockResolvedValue({ data: { posts: [], nextCursor: null, totalCount: 0 } } as never)
  mocked.post.mockResolvedValue({ data: { id: 1 } } as never)
  mocked.patch.mockResolvedValue({ data: { id: 1 } } as never)
  mocked.delete.mockResolvedValue({ data: undefined } as never)
})

it('getPosts는 params와 함께 GET /posts를 호출한다', async () => {
  const r = await getPosts({ type: 'best', search: 'q' })
  expect(mocked.get).toHaveBeenCalledWith('/posts', { params: { type: 'best', search: 'q' } })
  expect(r).toEqual({ posts: [], nextCursor: null, totalCount: 0 })
})
it('getPost는 GET /posts/:id를 호출한다', async () => {
  await getPost(2)
  expect(mocked.get).toHaveBeenCalledWith('/posts/2')
})
it('createPost는 /posts로 POST한다', async () => {
  await createPost({ title: 't', content: 'c' })
  expect(mocked.post).toHaveBeenCalledWith('/posts', { title: 't', content: 'c' })
})
it('patchPost는 /posts/:id로 PATCH한다', async () => {
  await patchPost(2, { title: 'u' })
  expect(mocked.patch).toHaveBeenCalledWith('/posts/2', { title: 'u' })
})
it('deletePost는 /posts/:id로 DELETE한다', async () => {
  await deletePost(2)
  expect(mocked.delete).toHaveBeenCalledWith('/posts/2')
})
it('getComments는 params와 함께 GET /posts/:id/comments를 호출한다', async () => {
  await getComments(2, { parentId: '5' })
  expect(mocked.get).toHaveBeenCalledWith('/posts/2/comments', { params: { parentId: '5' } })
})
it('createComment는 /posts/:id/comments로 POST한다', async () => {
  await createComment(2, { content: 'hi' })
  expect(mocked.post).toHaveBeenCalledWith('/posts/2/comments', { content: 'hi' })
})
it('patchComment는 /posts/:id/comments/:cid로 PATCH한다', async () => {
  await patchComment(2, 8, { content: 'edit' })
  expect(mocked.patch).toHaveBeenCalledWith('/posts/2/comments/8', { content: 'edit' })
})
it('deleteComment는 /posts/:id/comments/:cid로 DELETE한다', async () => {
  await deleteComment(2, 8)
  expect(mocked.delete).toHaveBeenCalledWith('/posts/2/comments/8')
})
it('likeComment는 likes 하위 경로로 POST한다', async () => {
  await likeComment(2, 8)
  expect(mocked.post).toHaveBeenCalledWith('/posts/2/comments/8/likes')
})
it('unlikeComment는 likes 하위 경로로 DELETE한다', async () => {
  await unlikeComment(2, 8)
  expect(mocked.delete).toHaveBeenCalledWith('/posts/2/comments/8/likes')
})
it('postKeys 팩토리는 안정적인 키를 생성한다', () => {
  expect(postKeys.list({ type: 'best' })).toEqual(['post', 'list', { type: 'best' }])
  expect(postKeys.detail(2)).toEqual(['post', 'detail', 2])
  expect(postKeys.comments(2, { parentId: '5' })).toEqual(['post', 'detail', 2, 'comments', { parentId: '5' }])
})
