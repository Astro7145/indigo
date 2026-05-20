import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  skipToken,
} from '@tanstack/react-query'
import {
  postKeys,
  getPosts,
  getPost,
  createPost,
  patchPost,
  deletePost,
  getComments,
  createComment,
  patchComment,
  deleteComment,
  likeComment,
  unlikeComment,
} from '@/src/api/post'
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
import type { ApiError } from '@/src/types/common'

// 한 게시글의 모든 comments 캐시(filter 변형 포함)를 한 번에 무효화하기 위한 prefix
export const commentsPrefix = (postId: number) =>
  [...postKeys.detail(postId), 'comments'] as const

export function usePostList(params: PostListParams = {}) {
  return useQuery<PostListResponse, ApiError>({
    queryKey: postKeys.list(params),
    queryFn: () => getPosts(params),
  })
}

export function useInfinitePostList(
  params: Omit<PostListParams, 'cursor'> = {},
) {
  return useInfiniteQuery<PostListResponse, ApiError>({
    queryKey: [...postKeys.list(params), 'infinite'],
    queryFn: ({ pageParam }) =>
      getPosts({ ...params, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  })
}

export function usePost(id: number | undefined) {
  return useQuery<Post, ApiError>({
    queryKey:
      id == null ? [...postKeys.details(), 'pending'] : postKeys.detail(id),
    queryFn: id == null ? skipToken : () => getPost(id),
  })
}

export function useComments(
  postId: number | undefined,
  params: CommentListParams = {},
) {
  return useQuery<CommentListResponse, ApiError>({
    queryKey: postKeys.comments(postId ?? -1, params),
    queryFn: () => getComments(postId as number, params),
    enabled: postId != null,
  })
}

export function useInfiniteComments(
  postId: number | undefined,
  params: Omit<CommentListParams, 'cursor'> = {},
) {
  return useInfiniteQuery<CommentListResponse, ApiError>({
    queryKey: [...postKeys.comments(postId ?? -1, params), 'infinite'],
    queryFn: ({ pageParam }) =>
      getComments(postId as number, {
        ...params,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: postId != null,
  })
}

export function useCreatePost() {
  const qc = useQueryClient()
  return useMutation<Post, ApiError, CreatePostBody>({
    mutationFn: (body) => createPost(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: postKeys.lists() })
    },
  })
}

export function useUpdatePost() {
  const qc = useQueryClient()
  return useMutation<Post, ApiError, { postId: number; body: UpdatePostBody }>({
    mutationFn: ({ postId, body }) => patchPost(postId, body),
    onSuccess: (_, { postId }) => {
      qc.invalidateQueries({ queryKey: postKeys.lists() })
      qc.invalidateQueries({ queryKey: postKeys.detail(postId) })
    },
  })
}

export function useDeletePost() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, number>({
    mutationFn: (id) => deletePost(id),
    onSuccess: (_, postId) => {
      qc.invalidateQueries({ queryKey: postKeys.lists() })
      qc.removeQueries({ queryKey: postKeys.detail(postId) })
    },
  })
}

export function useCreateComment(postId: number) {
  const qc = useQueryClient()
  return useMutation<Comment, ApiError, CreateCommentBody>({
    mutationFn: (body) => createComment(postId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commentsPrefix(postId) })
    },
  })
}

export function useUpdateComment(postId: number) {
  const qc = useQueryClient()
  return useMutation<
    Comment,
    ApiError,
    { commentId: number; body: UpdateCommentBody }
  >({
    mutationFn: ({ commentId, body }) => patchComment(postId, commentId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commentsPrefix(postId) })
    },
  })
}

export function useDeleteComment(postId: number) {
  const qc = useQueryClient()
  return useMutation<void, ApiError, number>({
    mutationFn: (commentId) => deleteComment(postId, commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commentsPrefix(postId) })
    },
  })
}

export function useLikeComment(postId: number) {
  const qc = useQueryClient()
  return useMutation<CommentLikeResponse, ApiError, number>({
    mutationFn: (commentId) => likeComment(postId, commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commentsPrefix(postId) })
    },
  })
}

export function useUnlikeComment(postId: number) {
  const qc = useQueryClient()
  return useMutation<CommentLikeResponse, ApiError, number>({
    mutationFn: (commentId) => unlikeComment(postId, commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commentsPrefix(postId) })
    },
  })
}
