'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Bounds } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { GRAPH_COLORS } from '@/src/components/common/graph/palette';
import GraphScene from '@/src/components/common/graph/GraphScene';
import type { GoalListItem } from '@/src/types/goal';
import type { Todo } from '@/src/types/todo';

interface GraphCanvasProps {
  goals: GoalListItem[];
  todos: Todo[];
}

/** three.js 캔버스 — dynamic(ssr:false)로만 로드된다. 카메라·컨트롤·별필드·Bloom·조명. */
export default function GraphCanvas({ goals, todos }: GraphCanvasProps) {
  return (
    <div className="h-[60dvh] min-h-[440px] w-full overflow-hidden rounded-2xl bg-indigo-900 sm:h-[70dvh]">
      <Canvas camera={{ position: [0, 6, 18], fov: 55 }} dpr={[1, 2]}>
        <color attach="background" args={[GRAPH_COLORS.background]} />
        <ambientLight intensity={0.6} />
        <pointLight position={[0, 0, 0]} intensity={140} distance={80} color={GRAPH_COLORS.moonGlow} />
        <Stars radius={120} depth={60} count={4000} factor={4} saturation={0} fade speed={0.5} />
        {/* 콘텐츠를 캔버스 크기에 맞춰 자동 프레이밍하고 리사이즈 시 재적합(반응형) */}
        <Bounds fit observe margin={1.2}>
          <GraphScene goals={goals} todos={todos} />
        </Bounds>
        <OrbitControls makeDefault enablePan enableZoom minDistance={6} maxDistance={48} />
        <EffectComposer>
          <Bloom intensity={1.1} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur radius={0.7} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
