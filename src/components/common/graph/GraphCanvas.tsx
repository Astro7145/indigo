'use client';

import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { getGraphColors } from '@/src/components/common/graph/palette';
import GraphScene from '@/src/components/common/graph/GraphScene';
import type { GoalListItem } from '@/src/types/goal';
import type { Todo } from '@/src/types/todo';

interface GraphCanvasProps {
  goals: GoalListItem[];
  todos: Todo[];
}

/** three.js 캔버스 — dynamic(ssr:false)로만 로드된다. 노드는 자체발광(unlit)이라 실시간 조명 없이 Bloom만 쓴다. */
export default function GraphCanvas({ goals, todos }: GraphCanvasProps) {
  // 노드 구성(추가·삭제·이동)이 바뀌면 GraphScene을 리마운트해 시뮬레이션을 새로 만든다.
  // done 토글 등 위치에 영향 없는 변화로는 리마운트하지 않아 드래그 위치가 유지된다.
  const graphKey = `${goals.map((g) => g.id).join(',')}|${todos
    .map((t) => `${t.id}:${t.goalId}:${t.noteIds?.length ?? 0}`)
    .join(',')}`;
  const colors = getGraphColors();
  const t = useTranslations('dashboard');
  // 좌상단 토글 — 기본 off(호버 시에만 라벨). GraphScene만 graphKey로 리마운트되고 이 컴포넌트는
  // 유지되므로 노드 구성이 바뀌어도 토글 상태는 보존된다(뷰를 떠났다 오면 off로 초기화).
  const [showAllGoalLabels, setShowAllGoalLabels] = useState(false);
  const [showAllTodoLabels, setShowAllTodoLabels] = useState(false);

  return (
    // 로딩 셸 → 캔버스 전환이 툭 튀지 않도록 어두운 배경 위로 부드럽게 페이드인
    <motion.div
      className="relative h-full w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* 라벨 토글 — 캔버스 위에 떠 있는 일반 DOM 체크박스(접근성). 컨테이너는 pointer-events-none,
          각 라벨만 auto라 라벨 밖 클릭은 캔버스(궤도)로 그대로 전달된다. z-40으로 노드 라벨(≤30) 위·
          모달/드로어(60·100+) 아래에 둔다. sm↑에선 콘텐츠 컬럼(max-w-328) 왼쪽 끝 + 대시보드 토글과
          같은 세로 위치(그래프 음수 마진 풀블리드를 top/px로 보정)에 맞춘다. */}
      <div className="pointer-events-none absolute inset-x-0 top-3 z-40 px-4 sm:top-12 sm:px-6 xl:top-20 xl:px-10">
        <div className="mx-auto flex w-full max-w-328 flex-col items-start gap-2">
          <label className="bg-indigo-alpha-30 pointer-events-auto flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-xs text-indigo-100 backdrop-blur-sm select-none">
            <input
              type="checkbox"
              checked={showAllGoalLabels}
              onChange={(e) => setShowAllGoalLabels(e.target.checked)}
              className="accent-indigo-500"
            />
            {t('graph.showGoalNames')}
          </label>
          <label className="bg-indigo-alpha-30 pointer-events-auto flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-xs text-indigo-100 backdrop-blur-sm select-none">
            <input
              type="checkbox"
              checked={showAllTodoLabels}
              onChange={(e) => setShowAllTodoLabels(e.target.checked)}
              className="accent-indigo-500"
            />
            {t('graph.showTodoNames')}
          </label>
        </div>
      </div>
      <Canvas camera={{ position: [0, 8, 30], fov: 55 }} dpr={[1, 2]}>
        <color attach="background" args={[colors.background]} />
        <Stars radius={120} depth={60} count={3000} factor={4} saturation={0} fade speed={0.5} />
        <GraphScene
          key={graphKey}
          goals={goals}
          todos={todos}
          showAllGoalLabels={showAllGoalLabels}
          showAllTodoLabels={showAllTodoLabels}
        />
        {/* 회전 중심을 달(원점)로 고정 */}
        <OrbitControls makeDefault enablePan enableZoom target={[0, 0, 0]} minDistance={6} maxDistance={90} />
        <EffectComposer>
          <Bloom intensity={0.7} luminanceThreshold={0.15} luminanceSmoothing={0.9} mipmapBlur radius={0.6} />
        </EffectComposer>
      </Canvas>
    </motion.div>
  );
}
