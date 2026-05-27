'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import Button from '@/src/components/common/buttons/Button';
import { IcPlus } from '@/src/components/common/icons/IcPlus';
import PostCard from '@/src/components/post/PostCard';
import PostListEmpty from '@/src/components/post/PostListEmpty';
import PostListItem from '@/src/components/post/PostListItem';
import PostSearchBar from '@/src/components/post/PostSearchBar';
import { useInfinitePostList, usePostList } from '@/src/hooks/post';

export default function PostsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || undefined;

  const { data: bestData } = usePostList({ type: 'best', limit: 3 });
  const bestPosts = bestData?.posts ?? [];

  const { data: listData, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = useInfinitePostList({ search });
  const posts = listData?.pages.flatMap((page) => page.posts) ?? [];

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <header className="mx-auto mb-6 max-w-5xl">
        <h1 className="text-xl font-bold text-slate-900 md:text-2xl">소통 게시판</h1>
      </header>

      {/* 베스트 게시글 — 데이터 로드 후 노출. 모바일: 가로 스크롤 / md+: 3열 grid */}
      {bestPosts.length > 0 && (
        <section className="mx-auto mb-6 max-w-5xl">
          <div className="-mx-4 flex [scrollbar-width:none] gap-3 overflow-x-auto px-4 [-ms-overflow-style:none] md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:px-0 [&::-webkit-scrollbar]:hidden">
            {bestPosts.map((post) => (
              <PostCard key={post.id} post={post} onClick={() => router.push(`/posts/${post.id}`)} />
            ))}
          </div>
        </section>
      )}

      {/* 검색·정렬 */}
      <section className="mx-auto mb-4 max-w-5xl">
        <PostSearchBar />
      </section>

      {/* 목록 또는 빈 상태 */}
      <section className="mx-auto max-w-5xl">
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
        className="fixed right-4 bottom-4 md:right-8 md:bottom-16"
      >
        <span className="hidden md:inline">게시물 작성하기</span>
      </Button>
    </div>
  );
}
