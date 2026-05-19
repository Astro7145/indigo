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

it('getPosts GET /posts with params', async () => {
  await getPosts({ type: 'best', search: 'q' })
  expect(mocked.get).toHaveBeenCalledWith('/posts', { params: { type: 'best', search: 'q' } })
})
it('getPost GET /posts/:id', async () => {
  await getPost(2)
  expect(mocked.get).toHaveBeenCalledWith('/posts/2')
})
it('createPost POST /posts', async () => {
  await createPost({ title: 't', content: 'c' })
  expect(mocked.post).toHaveBeenCalledWith('/posts', { title: 't', content: 'c' })
})
it('patchPost PATCH /posts/:id', async () => {
  await patchPost(2, { title: 'u' })
  expect(mocked.patch).toHaveBeenCalledWith('/posts/2', { title: 'u' })
})
it('deletePost DELETE /posts/:id', async () => {
  await deletePost(2)
  expect(mocked.delete).toHaveBeenCalledWith('/posts/2')
})
it('getComments GET /posts/:id/comments with params', async () => {
  await getComments(2, { parentId: '5' })
  expect(mocked.get).toHaveBeenCalledWith('/posts/2/comments', { params: { parentId: '5' } })
})
it('createComment POST /posts/:id/comments', async () => {
  await createComment(2, { content: 'hi' })
  expect(mocked.post).toHaveBeenCalledWith('/posts/2/comments', { content: 'hi' })
})
it('patchComment PATCH /posts/:id/comments/:cid', async () => {
  await patchComment(2, 8, { content: 'edit' })
  expect(mocked.patch).toHaveBeenCalledWith('/posts/2/comments/8', { content: 'edit' })
})
it('deleteComment DELETE /posts/:id/comments/:cid', async () => {
  await deleteComment(2, 8)
  expect(mocked.delete).toHaveBeenCalledWith('/posts/2/comments/8')
})
it('likeComment POST likes subpath', async () => {
  await likeComment(2, 8)
  expect(mocked.post).toHaveBeenCalledWith('/posts/2/comments/8/likes')
})
it('unlikeComment DELETE likes subpath', async () => {
  await unlikeComment(2, 8)
  expect(mocked.delete).toHaveBeenCalledWith('/posts/2/comments/8/likes')
})
it('postKeys.comments', () => {
  expect(postKeys.comments(2, { parentId: '5' })).toEqual(['post', 'detail', 2, 'comments', { parentId: '5' }])
})
