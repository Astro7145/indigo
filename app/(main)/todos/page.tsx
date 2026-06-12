import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { prefetchInfiniteTodos } from '@/src/api/server/prefetch';
import { getQueryClient } from '@/src/api/server/query-client';
import TodosView, { listParams, parseTodosTab } from '@/src/components/todo/TodosView';

/**
 * 모든 할 일 라우트(`/todos`). 서버 셸 — `?tab=`(이슈 #104)을 파싱해 해당 탭의 첫 페이지를
 * prefetch하고(#136), `key`로 쿼리 변경 시 본문을 리마운트해 탭 초기값이 항상 URL과 일치한다.
 */
export default async function TodosPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab: raw } = await searchParams;
  const tab = parseTodosTab(raw);

  const qc = getQueryClient();
  await prefetchInfiniteTodos(qc, listParams(tab));

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <TodosView key={tab} initialTab={tab} />
    </HydrationBoundary>
  );
}
