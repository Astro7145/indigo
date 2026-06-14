import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { prefetchPosts } from '@/src/api/server/prefetch';
import { getQueryClient } from '@/src/api/server/query-client';
import PostList from '@/src/components/post/PostList';

/**
 * 소통 게시판 라우트(`/posts`). 서버 셸 — searchParams를 파싱해 목록·인기글 첫 페이지를
 * prefetch한다. searchParams 자체는 본문(PostList)이 useSearchParams로 직접 읽는다.
 * PostList가 useSearchParams를 호출하므로 Suspense로 감싸 prerender CSR bailout이 셸까지 번지지 않게 한다.
 */
export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sortBy?: string }>;
}) {
  const { search, sortBy } = await searchParams;
  const type = sortBy === 'popular' ? 'best' : 'all';

  const qc = getQueryClient();
  await prefetchPosts(qc, { ...(search ? { search } : {}), type });

  return (
    <div>
      {/* 모바일은 (main) layout의 Topbar가 페이지명을 표시하므로 중복을 피해 sm 이상에서만 노출 */}
      <header className="mx-auto mb-6 hidden max-w-[1200px] sm:block">
        <h1 className="text-xl font-bold text-slate-900 xl:text-2xl">소통 게시판</h1>
      </header>
      <HydrationBoundary state={dehydrate(qc)}>
        <Suspense fallback={<div />}>
          <PostList />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
}
