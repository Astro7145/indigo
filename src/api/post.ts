import instance from '@/src/api/axiosInstance'
import type {
  Post,
  PostListParams,
  PostListResponse,
  CreatePostBody,
  UpdatePostBody,
  Comment,
  CommentListParams,
  CommentListResponse,
  CreateCommentBody,
  UpdateCommentBody,
  CommentLikeResponse,
} from '@/src/types/post'

export const postKeys = {
  all: ['post'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters: PostListParams = {}) => [...postKeys.lists(), filters] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: number) => [...postKeys.details(), id] as const,
  comments: (postId: number, filters: CommentListParams = {}) =>
    [...postKeys.detail(postId), 'comments', filters] as const,
}

export async function getPosts(params: PostListParams = {}): Promise<PostListResponse> {
  const { data } = await instance.get<PostListResponse>('/posts', { params })
  return data
}

export async function getPost(postId: number): Promise<Post> {
  const { data } = await instance.get<Post>(`/posts/${postId}`)
  return data
}

export async function createPost(body: CreatePostBody): Promise<Post> {
  const { data } = await instance.post<Post>('/posts', body)
  return data
}

export async function patchPost(postId: number, body: UpdatePostBody): Promise<Post> {
  const { data } = await instance.patch<Post>(`/posts/${postId}`, body)
  return data
}

export async function deletePost(postId: number): Promise<void> {
  await instance.delete(`/posts/${postId}`)
}

export async function getComments(
  postId: number,
  params: CommentListParams = {},
): Promise<CommentListResponse> {
  const { data } = await instance.get<CommentListResponse>(
    `/posts/${postId}/comments`,
    { params },
  )
  return data
}

export async function createComment(
  postId: number,
  body: CreateCommentBody,
): Promise<Comment> {
  const { data } = await instance.post<Comment>(`/posts/${postId}/comments`, body)
  return data
}

export async function patchComment(
  postId: number,
  commentId: number,
  body: UpdateCommentBody,
): Promise<Comment> {
  const { data } = await instance.patch<Comment>(
    `/posts/${postId}/comments/${commentId}`,
    body,
  )
  return data
}

export async function deleteComment(postId: number, commentId: number): Promise<void> {
  await instance.delete(`/posts/${postId}/comments/${commentId}`)
}

export async function likeComment(
  postId: number,
  commentId: number,
): Promise<CommentLikeResponse> {
  const { data } = await instance.post<CommentLikeResponse>(
    `/posts/${postId}/comments/${commentId}/likes`,
  )
  return data
}

export async function unlikeComment(
  postId: number,
  commentId: number,
): Promise<CommentLikeResponse> {
  const { data } = await instance.delete<CommentLikeResponse>(
    `/posts/${postId}/comments/${commentId}/likes`,
  )
  return data
}
