'use client';

import { getGraphColors } from '@/src/components/common/graph/palette';
import type { Vec3 } from '@/src/utils/graphLayout';

/** 중앙 달(나) — 발광하는 구. 후광은 Bloom 포스트프로세싱이 만들어준다. */
export default function MoonNode({ position }: { position: Vec3 }) {
  const colors = getGraphColors();
  return (
    <mesh position={position}>
      <sphereGeometry args={[1.6, 48, 48]} />
      <meshStandardMaterial color={colors.moon} emissive={colors.moonGlow} emissiveIntensity={0.75} />
    </mesh>
  );
}
