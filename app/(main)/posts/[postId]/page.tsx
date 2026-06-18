import { notFound } from 'next/navigation';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { prefetchPostDetail } from '@/src/api/server/prefetch';
import { getQueryClient } from '@/src/api/server/query-client';
import PostDetailView from '@/src/components/post/PostDetailView';

/**
 * 게시물 상세 라우트(`/posts/[postId]`). 서버 셸 — post 단건 + 댓글 무한 첫 페이지를
 * prefetch해 첫 HTML에 본문·댓글이 실리게 한다.
 * me는 (main) layout이 이미 prefetch하므로 여기서 추가하지 않는다.
 */
export default async function PostDetailPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId: raw } = await params;
  const postId = Number(raw);
  if (!Number.isInteger(postId) || postId <= 0) notFound();

  const qc = getQueryClient();
  await prefetchPostDetail(qc, postId);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <PostDetailView postId={postId} />
    </HydrationBoundary>
  );
}
