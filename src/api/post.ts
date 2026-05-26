import instance from '@/src/api/axiosInstance';
import type { Post, PostListParams, PostListResponse, CreatePostBody, UpdatePostBody } from '@/src/types/post';

export const postKeys = {
  all: ['post'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters: PostListParams = {}) => [...postKeys.lists(), filters] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: number) => [...postKeys.details(), id] as const,
};

export async function getPosts(params: PostListParams = {}): Promise<PostListResponse> {
  const { data } = await instance.get<PostListResponse>('/posts', { params });
  return data;
}

export async function getPost(postId: number): Promise<Post> {
  const { data } = await instance.get<Post>(`/posts/${postId}`);
  return data;
}

export async function createPost(body: CreatePostBody): Promise<Post> {
  const { data } = await instance.post<Post>('/posts', body);
  return data;
}

export async function patchPost(postId: number, body: UpdatePostBody): Promise<Post> {
  const { data } = await instance.patch<Post>(`/posts/${postId}`, body);
  return data;
}

export async function deletePost(postId: number): Promise<void> {
  await instance.delete(`/posts/${postId}`);
}
