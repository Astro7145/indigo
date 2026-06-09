import { useQuery, useInfiniteQuery, useMutation, useQueryClient, skipToken } from '@tanstack/react-query';
import { postKeys } from '@/src/api/post';
import {
  commentKeys,
  getComments,
  createComment,
  patchComment,
  deleteComment,
  likeComment,
  unlikeComment,
} from '@/src/api/comment';
import type {
  Comment,
  CommentListParams,
  CommentListResponse,
  CreateCommentBody,
  UpdateCommentBody,
  CommentLikeResponse,
} from '@/src/types/comment';
import type { ApiError } from '@/src/types/common';

export function useComments(postId: number | undefined, params: CommentListParams = {}) {
  return useQuery<CommentListResponse, ApiError, CommentListResponse>({
    queryKey:
      postId == null ? [...postKeys.details(), 'pending', 'comments', params] : commentKeys.list(postId, params),
    queryFn: postId == null ? skipToken : () => getComments(postId, params),
    // API에 sort 옵션이 없고 최신순으로 응답이 오므로 작성순(오래된 것이 위)으로 오도록 추가
    select: (data) => ({
      ...data,
      comments: [...data.comments].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    }),
  });
}

export function useInfiniteComments(postId: number | undefined, params: Omit<CommentListParams, 'cursor'> = {}) {
  return useInfiniteQuery<CommentListResponse, ApiError>({
    queryKey:
      postId == null
        ? [...postKeys.details(), 'pending', 'comments', params, 'infinite']
        : [...commentKeys.list(postId, params), 'infinite'],
    queryFn:
      postId == null
        ? skipToken
        : ({ pageParam }) =>
            getComments(postId, {
              ...params,
              cursor: pageParam as string | undefined,
            }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}

export function useCreateComment(postId: number) {
  const qc = useQueryClient();
  return useMutation<Comment, ApiError, CreateCommentBody>({
    mutationFn: (body) => createComment(postId, body),
    onSuccess: () => {
      // Post.commentCount는 상세 + 목록 카드 양쪽에 나타나므로 둘 다 동기화.
      // detail 무효화는 그 하위 comments 캐시도 prefix 매칭으로 함께 잡는다.
      qc.invalidateQueries({ queryKey: postKeys.detail(postId) });
      qc.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

export function useUpdateComment(postId: number) {
  const qc = useQueryClient();
  return useMutation<Comment, ApiError, { commentId: number; body: UpdateCommentBody }>({
    mutationFn: ({ commentId, body }) => patchComment(postId, commentId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commentKeys.lists(postId) });
    },
  });
}

export function useDeleteComment(postId: number) {
  const qc = useQueryClient();
  return useMutation<void, ApiError, number>({
    mutationFn: (commentId) => deleteComment(postId, commentId),
    onSuccess: () => {
      // Post.commentCount는 상세 + 목록 카드 양쪽에 나타나므로 둘 다 동기화.
      // detail 무효화는 그 하위 comments 캐시도 prefix 매칭으로 함께 잡는다.
      qc.invalidateQueries({ queryKey: postKeys.detail(postId) });
      qc.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

export function useLikeComment(postId: number) {
  const qc = useQueryClient();
  return useMutation<CommentLikeResponse, ApiError, number>({
    mutationFn: (commentId) => likeComment(postId, commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commentKeys.lists(postId) });
    },
  });
}

export function useUnlikeComment(postId: number) {
  const qc = useQueryClient();
  return useMutation<CommentLikeResponse, ApiError, number>({
    mutationFn: (commentId) => unlikeComment(postId, commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commentKeys.lists(postId) });
    },
  });
}
