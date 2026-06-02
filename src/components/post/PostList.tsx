'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import Button from '@/src/components/common/buttons/Button';
import { IcPlus } from '@/src/components/common/icons/IcPlus';
import PostCard from '@/src/components/post/PostCard';
import PostCardSkeleton from '@/src/components/post/PostCardSkeleton';
import PostListEmpty from '@/src/components/post/PostListEmpty';
import PostListItem from '@/src/components/post/PostListItem';
import PostSearchBar from '@/src/components/post/PostSearchBar';
import { useInfinitePostList, usePostList } from '@/src/hooks/post';

export default function PostList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || undefined;
  const sortBy = searchParams.get('sortBy');
  const type = sortBy === 'popular' ? 'best' : 'all';

  const { data: bestData, isPending: isBestPending } = usePostList({ type: 'best', limit: 3 }); //인기글
  const bestPosts = bestData?.posts ?? [];

  const {
    data: listData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    isPending,
  } = useInfinitePostList({ search, type });
  const posts = listData?.pages.flatMap((page) => page.posts) ?? [];

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    // 다음 페이지 fetch 실패 시 sentinel을 관찰하지 않는다 — 화면에 남아 있는 한 IO가 즉시
    // 다시 교차해 fetchNextPage를 무한 재호출(API 스팸)하기 때문.
    if (!sentinel || !hasNextPage || isFetchingNextPage || isFetchNextPageError) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextPage();
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  return (
    <>
      {/* 베스트 게시글 — fetch 중에는 동일 외곽 스켈레톤 3개로 자리를 잡아 아래 영역이 밀리지 않게 한다.
          데이터 도착 후 0개면 영역 자체를 숨긴다. 모바일: 가로 스크롤 / md+: 3열 grid. */}
      {(isBestPending || bestPosts.length > 0) && (
        <section className="mx-auto mb-6 max-w-[1200px]">
          <div className="-mx-4 flex [scrollbar-width:none] gap-3 overflow-x-auto px-4 [-ms-overflow-style:none] md:mx-0 md:gap-6 md:px-0 xl:grid xl:grid-cols-3 [&::-webkit-scrollbar]:hidden">
            {isBestPending
              ? Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)
              : bestPosts.map((post) => (
                  <PostCard key={post.id} post={post} onClick={() => router.push(`/posts/${post.id}`)} />
                ))}
          </div>
        </section>
      )}

      {/* 검색·정렬 */}
      <section className="mx-auto mb-4 max-w-[1200px]">
        <PostSearchBar />
      </section>

      {/* 목록 또는 빈 상태 */}
      <section className="mx-auto max-w-[1200px]">
        {!isPending && posts.length === 0 ? (
          <PostListEmpty />
        ) : (
          <>
            <ul>
              {posts.map((p) => (
                <li key={p.id}>
                  <PostListItem post={p} onClick={() => router.push(`/posts/${p.id}`)} />
                </li>
              ))}
            </ul>
            <div ref={sentinelRef} aria-hidden className="h-4 w-full" />
          </>
        )}
      </section>

      {/* 게시물 작성 버튼 — 우측 하단 고정. 모바일은 아이콘만, md+는 텍스트 포함 */}
      <Button
        type="button"
        size="large"
        startIcon={<IcPlus />}
        onClick={() => router.push('/posts/write')}
        className="fixed right-4 bottom-4 p-[13px] md:right-8 md:bottom-16 md:min-w-[190px] md:px-[18px] md:py-[13px]"
      >
        <span className="hidden md:inline">게시물 작성하기</span>
      </Button>
    </>
  );
}
