export interface PostWriter {
  id: number;
  name: string;
  image: string | null;
}

export interface Post {
  id: number;
  teamId: string;
  userId: number;
  title: string;
  content: string;
  image: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  writer: PostWriter;
  commentCount: number;
}

export interface PostListParams {
  cursor?: string;
  limit?: number;
  type?: 'all' | 'best';
  search?: string;
}

export interface PostListResponse {
  posts: Post[];
  nextCursor: string | null;
  totalCount: number;
}

export interface CreatePostBody {
  title: string;
  content: string;
  image?: string;
}

export interface UpdatePostBody {
  title?: string;
  content?: string;
  image?: string | null;
}

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
