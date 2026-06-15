'use client';

import { GRAPH_COLORS } from '@/src/components/common/graph/palette';
import { useTwinkle } from '@/src/components/common/graph/useTwinkle';
import type { Vec3 } from '@/src/utils/graphLayout';

interface NoteNodeProps {
  position: Vec3;
  /** 트윙클 위상 시드(노드마다 깜빡임을 어긋나게) — 보통 노트 id. */
  seed: number;
}

/** 노트 = 위성. 클릭/연결은 노트 작업 완료 후 추가 예정(현재 표시 전용). */
export default function NoteNode({ position, seed }: NoteNodeProps) {
  // 노트 클릭/연결 지점: 노트 라우트 확정 시 onClick + router.push 추가.
  const matRef = useTwinkle(0.9, seed, 0.25);
  return (
    <mesh position={position} scale={0.18}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial
        ref={matRef}
        color={GRAPH_COLORS.note}
        emissive={GRAPH_COLORS.note}
        emissiveIntensity={0.9}
      />
    </mesh>
  );
}
