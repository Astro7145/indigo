'use client';

import { GRAPH_COLORS } from '@/src/components/graph/palette';
import type { Vec3 } from '@/src/utils/graphLayout';

/** 노트 = 위성. 클릭/연결은 노트 작업 완료 후 추가 예정(현재 표시 전용). */
export default function NoteNode({ position }: { position: Vec3 }) {
  // 노트 클릭/연결 지점: 노트 라우트 확정 시 onClick + router.push 추가.
  return (
    <mesh position={position} scale={0.18}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial color={GRAPH_COLORS.note} emissive={GRAPH_COLORS.note} emissiveIntensity={0.9} />
    </mesh>
  );
}
