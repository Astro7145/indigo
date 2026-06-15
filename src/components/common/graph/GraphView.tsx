'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { animate } from 'motion/react';
import { useGoalList } from '@/src/hooks/goal';
import { useAllTodos } from '@/src/hooks/todo';
import Moonphase from '@/src/components/common/icons/Moonphase';

const GraphCanvas = dynamic(() => import('@/src/components/common/graph/GraphCanvas'), {
  ssr: false,
  loading: () => (
    <GraphShell>
      <MoonLoading />
    </GraphShell>
  ),
});

/** 부모(풀블리드 컨테이너)를 채우는 다크 셸 — 로딩/에러/빈 상태 공용. */
function GraphShell({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full w-full items-center justify-center text-sm text-indigo-300">{children}</div>;
}

/**
 * 로딩 인디케이터 — motion의 animate로 달 위상(percent)을 0↔100 왕복(mirror)시켜 차오름/기욺을 반복한다.
 * Moonphase는 숫자 prop(percent)을 받으므로 motion 값을 React 상태로 브리지한다(prop은 직접 애니메이션 불가).
 */
function MoonLoading() {
  const [percent, setPercent] = useState(0);
  useEffect(() => {
    const controls = animate(0, 100, {
      duration: 1.6,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'mirror',
      onUpdate: setPercent,
    });
    return () => controls.stop();
  }, []);

  return (
    <span role="status" aria-label="우주를 그리는 중" className="inline-block">
      <Moonphase percent={percent} className="size-20" />
    </span>
  );
}

/**
 * 기존 도메인 훅(useGoalList·useAllTodos)으로 전체 목표·할일을 불러와 그래프에 주입한다.
 * 데이터는 Canvas 바깥에서 받고 결과만 props로 넘긴다(GraphCanvas는 three.js 지연 로드).
 */
export default function GraphView() {
  const goalsQuery = useGoalList();
  const todosQuery = useAllTodos();

  if (goalsQuery.isPending || todosQuery.isPending)
    return (
      <GraphShell>
        <MoonLoading />
      </GraphShell>
    );
  if (goalsQuery.isError || todosQuery.isError) return <GraphShell>그래프를 불러오지 못했어요</GraphShell>;

  const goals = goalsQuery.data?.goals ?? [];
  const todos = todosQuery.data?.todos ?? [];
  if (goals.length === 0) return <GraphShell>아직 목표가 없어요. 목표를 추가하면 별이 떠요 ✨</GraphShell>;

  return <GraphCanvas goals={goals} todos={todos} />;
}
