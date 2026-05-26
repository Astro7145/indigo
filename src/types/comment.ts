import type { PostWriter } from '@/src/types/post';

export interface Comment {
  id: number;
  teamId: string;
  userId: number;
  postId: number;
  parentId: number | null;
  content: string;
  likeCount: number;
  replyCount?: number; // 최상위 댓글에만 존재, 대댓글 응답에는 없음 (spec: not in required)
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
  writer: PostWriter;
}

export interface CommentListParams {
  cursor?: string;
  limit?: number;
  parentId?: string; // 쿼리 파라미터라 문자열 (응답 Comment.parentId는 number | null)
}

export interface CommentListResponse {
  comments: Comment[];
  nextCursor: string | null;
  totalCount: number;
}

export interface CreateCommentBody {
  content: string;
  parentId?: number;
}

export interface UpdateCommentBody {
  content: string;
}

export interface CommentLikeResponse {
  isLiked: boolean;
  likeCount: number;
}
