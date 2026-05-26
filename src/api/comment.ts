import instance from '@/src/api/axiosInstance';
import { postKeys } from '@/src/api/post';
import type {
  Comment,
  CommentListParams,
  CommentListResponse,
  CreateCommentBody,
  UpdateCommentBody,
  CommentLikeResponse,
} from '@/src/types/comment';

// comments 캐시는 post 상세 하위에 둔다 (API 경로가 /posts/:id/comments이고
// post 상세 무효화/제거 시 prefix 매칭으로 함께 잡히도록).
export const commentKeys = {
  lists: (postId: number) => [...postKeys.detail(postId), 'comments'] as const,
  list: (postId: number, filters: CommentListParams = {}) => [...commentKeys.lists(postId), filters] as const,
};

export async function getComments(postId: number, params: CommentListParams = {}): Promise<CommentListResponse> {
  const { data } = await instance.get<CommentListResponse>(`/posts/${postId}/comments`, { params });
  return data;
}

export async function createComment(postId: number, body: CreateCommentBody): Promise<Comment> {
  const { data } = await instance.post<Comment>(`/posts/${postId}/comments`, body);
  return data;
}

export async function patchComment(postId: number, commentId: number, body: UpdateCommentBody): Promise<Comment> {
  const { data } = await instance.patch<Comment>(`/posts/${postId}/comments/${commentId}`, body);
  return data;
}

export async function deleteComment(postId: number, commentId: number): Promise<void> {
  await instance.delete(`/posts/${postId}/comments/${commentId}`);
}

export async function likeComment(postId: number, commentId: number): Promise<CommentLikeResponse> {
  const { data } = await instance.post<CommentLikeResponse>(`/posts/${postId}/comments/${commentId}/likes`);
  return data;
}

export async function unlikeComment(postId: number, commentId: number): Promise<CommentLikeResponse> {
  const { data } = await instance.delete<CommentLikeResponse>(`/posts/${postId}/comments/${commentId}/likes`);
  return data;
}
