'use client';

import dynamic from 'next/dynamic';
import { useGoalList } from '@/src/hooks/goal';
import { useAllTodos } from '@/src/hooks/todo';

const GraphCanvas = dynamic(() => import('@/src/components/common/graph/GraphCanvas'), {
  ssr: false,
  loading: () => <GraphShell>우주를 그리는 중…</GraphShell>,
});

/** 그래프 영역과 동일 크기의 다크 셸 — 로딩/에러/빈 상태 공용. */
function GraphShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[70dvh] min-h-[480px] w-full items-center justify-center rounded-2xl bg-indigo-900 text-sm text-indigo-300">
      {children}
    </div>
  );
}

/**
 * 기존 도메인 훅(useGoalList·useAllTodos)으로 전체 목표·할일을 불러와 그래프에 주입한다.
 * 데이터는 Canvas 바깥에서 받고 결과만 props로 넘긴다(GraphCanvas는 three.js 지연 로드).
 */
export default function GraphView() {
  const goalsQuery = useGoalList();
  const todosQuery = useAllTodos();

  if (goalsQuery.isPending || todosQuery.isPending) return <GraphShell>우주를 그리는 중…</GraphShell>;
  if (goalsQuery.isError || todosQuery.isError) return <GraphShell>그래프를 불러오지 못했어요</GraphShell>;

  const goals = goalsQuery.data?.goals ?? [];
  const todos = todosQuery.data?.todos ?? [];
  if (goals.length === 0) return <GraphShell>아직 목표가 없어요. 목표를 추가하면 별이 떠요 ✨</GraphShell>;

  return <GraphCanvas goals={goals} todos={todos} />;
}
