'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { motion } from 'motion/react';
import { getGraphColors } from '@/src/components/common/graph/palette';
import GraphScene from '@/src/components/common/graph/GraphScene';
import type { GoalListItem } from '@/src/types/goal';
import type { Todo } from '@/src/types/todo';

interface GraphCanvasProps {
  goals: GoalListItem[];
  todos: Todo[];
}

/** three.js 캔버스 — dynamic(ssr:false)로만 로드된다. 카메라·컨트롤·별필드·Bloom·조명. */
export default function GraphCanvas({ goals, todos }: GraphCanvasProps) {
  // 노드 구성(추가·삭제·이동)이 바뀌면 GraphScene을 리마운트해 시뮬레이션을 새로 만든다.
  // done 토글 등 위치에 영향 없는 변화로는 리마운트하지 않아 드래그 위치가 유지된다.
  const graphKey = `${goals.map((g) => g.id).join(',')}|${todos
    .map((t) => `${t.id}:${t.goalId}:${t.noteIds?.length ?? 0}`)
    .join(',')}`;
  const colors = getGraphColors();

  return (
    // 로딩 셸 → 캔버스 전환이 툭 튀지 않도록 어두운 배경 위로 부드럽게 페이드인
    <motion.div
      className="h-full w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <Canvas camera={{ position: [0, 6, 18], fov: 55 }} dpr={[1, 2]}>
        <color attach="background" args={[colors.background]} />
        <ambientLight intensity={0.6} />
        <pointLight position={[0, 0, 0]} intensity={140} distance={80} color={colors.moonGlow} />
        <Stars radius={120} depth={60} count={4000} factor={4} saturation={0} fade speed={0.5} />
        <GraphScene key={graphKey} goals={goals} todos={todos} />
        {/* 회전 중심을 달(원점)로 고정 */}
        <OrbitControls makeDefault enablePan enableZoom target={[0, 0, 0]} minDistance={6} maxDistance={48} />
        <EffectComposer>
          <Bloom intensity={1.1} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur radius={0.7} />
        </EffectComposer>
      </Canvas>
    </motion.div>
  );
}
