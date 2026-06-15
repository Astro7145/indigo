'use client';

import dynamic from 'next/dynamic';
import AsyncBoundary from '@/src/components/common/AsyncBoundary';
import { useGraphData } from '@/src/hooks/graph';

const GraphCanvas = dynamic(() => import('@/src/components/graph/GraphCanvas'), {
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

/** 데이터를 Canvas 바깥에서 suspend시키고(props 주입), 빈 목록은 안내로 대체. */
function GraphContent() {
  const { goals, todos } = useGraphData();
  if (goals.length === 0) return <GraphShell>아직 목표가 없어요. 목표를 추가하면 별이 떠요 ✨</GraphShell>;
  return <GraphCanvas goals={goals} todos={todos} />;
}

export default function GraphView() {
  return (
    <AsyncBoundary
      fallback={<GraphShell>우주를 그리는 중…</GraphShell>}
      errorFallback={<GraphShell>그래프를 불러오지 못했어요</GraphShell>}
    >
      <GraphContent />
    </AsyncBoundary>
  );
}
