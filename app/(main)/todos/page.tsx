import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { prefetchInfiniteTodos } from '@/src/api/server/prefetch';
import { getQueryClient } from '@/src/api/server/query-client';
import TodosView from '@/src/components/todo/TodosView';
import { todosListParams, parseTodosTab } from '@/src/components/todo/todosTab';

/**
 * 모든 할 일 라우트(`/todos`). 서버 셸 — `?tab=`을 파싱해 해당 탭의 첫 페이지를
 * prefetch한다. 탭 상태 자체는 본문이 useSearchParams로 직접 읽는다(뒤로가기 시 prop 어긋남 방지).
 */
export default async function TodosPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab: raw } = await searchParams;
  const tab = parseTodosTab(raw);

  const qc = getQueryClient();
  await prefetchInfiniteTodos(qc, todosListParams(tab));

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <TodosView />
    </HydrationBoundary>
  );
}
