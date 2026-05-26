import { useQuery, useInfiniteQuery, useMutation, useQueryClient, skipToken } from '@tanstack/react-query';
import { postKeys, getPosts, getPost, createPost, patchPost, deletePost } from '@/src/api/post';
import type { Post, PostListParams, PostListResponse, CreatePostBody, UpdatePostBody } from '@/src/types/post';
import type { ApiError } from '@/src/types/common';

export function usePostList(params: PostListParams = {}) {
  return useQuery<PostListResponse, ApiError>({
    queryKey: postKeys.list(params),
    queryFn: () => getPosts(params),
  });
}

export function useInfinitePostList(params: Omit<PostListParams, 'cursor'> = {}) {
  return useInfiniteQuery<PostListResponse, ApiError>({
    queryKey: [...postKeys.list(params), 'infinite'],
    queryFn: ({ pageParam }) => getPosts({ ...params, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}

export function usePost(id: number | undefined) {
  return useQuery<Post, ApiError>({
    queryKey: id == null ? [...postKeys.details(), 'pending'] : postKeys.detail(id),
    queryFn: id == null ? skipToken : () => getPost(id),
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation<Post, ApiError, CreatePostBody>({
    mutationFn: (body) => createPost(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation<Post, ApiError, { postId: number; body: UpdatePostBody }>({
    mutationFn: ({ postId, body }) => patchPost(postId, body),
    onSuccess: (data, { postId }) => {
      qc.invalidateQueries({ queryKey: postKeys.lists() });
      // PATCH 응답 shape가 GET 응답과 동일하므로 detail 캐시 직접 갱신 (refetch 1회 절감).
      qc.setQueryData(postKeys.detail(postId), data);
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation<void, ApiError, number>({
    mutationFn: (id) => deletePost(id),
    onSuccess: (_, postId) => {
      qc.invalidateQueries({ queryKey: postKeys.lists() });
      // detail 제거 시 그 하위 comments 캐시(`[...detail(postId), 'comments', ...]`)도
      // prefix 매칭으로 함께 제거된다.
      qc.removeQueries({ queryKey: postKeys.detail(postId) });
    },
  });
}
