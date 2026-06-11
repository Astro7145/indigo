import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { prefetchInfiniteTodos } from '@/src/api/server/prefetch';
import { getQueryClient } from '@/src/api/server/query-client';
import TodosView from '@/src/components/todo/TodosView';

/** 모든 할 일 라우트(`/todos`). 서버 셸 — ALL 탭 첫 페이지를 prefetch해 하이드레이션한다(#136). */
export default async function TodosPage() {
  const qc = getQueryClient();
  await prefetchInfiniteTodos(qc, { sort: 'latest', limit: 40 });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <TodosView />
    </HydrationBoundary>
  );
}
