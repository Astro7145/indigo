import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { prefetchAllGoals, prefetchFavorites } from '@/src/api/server/prefetch';
import { getQueryClient } from '@/src/api/server/query-client';
import FavoritesView, { parseFavoritesTab } from '@/src/components/favorite/FavoritesView';

/**
 * 찜한 할 일 라우트(`/favorites`). 서버 셸 — 찜 목록(목록·카운트 공유 키)과 목표 필터를 prefetch한다(#136).
 * `?tab=`(이슈 #104)은 초기 탭으로만 쓰인다 — 탭 필터링은 클라이언트라 prefetch는 탭과 무관.
 */
export default async function FavoritesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab: raw } = await searchParams;
  const tab = parseFavoritesTab(raw);

  const qc = getQueryClient();
  await Promise.all([prefetchFavorites(qc), prefetchAllGoals(qc)]);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <FavoritesView key={tab} initialTab={tab} />
    </HydrationBoundary>
  );
}
