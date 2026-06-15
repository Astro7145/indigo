'use client';

import { GRAPH_COLORS } from '@/src/components/common/graph/palette';
import type { Vec3 } from '@/src/utils/graphLayout';

/** 중앙 달(나) — 은은히 발광하는 구. */
export default function MoonNode({ position }: { position: Vec3 }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[1.6, 48, 48]} />
      <meshStandardMaterial color={GRAPH_COLORS.moon} emissive={GRAPH_COLORS.moonGlow} emissiveIntensity={0.85} />
    </mesh>
  );
}
