'use client';

import { AdditiveBlending } from 'three';
import { getGraphColors } from '@/src/components/common/graph/palette';
import type { Vec3 } from '@/src/utils/graphLayout';

/** 중앙 달(나) — 발광하는 구 + 가산 혼합 후광. */
export default function MoonNode({ position }: { position: Vec3 }) {
  const colors = getGraphColors();
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[1.6, 48, 48]} />
        <meshStandardMaterial color={colors.moon} emissive={colors.moonGlow} emissiveIntensity={0.9} />
      </mesh>
      {/* 후광 — 살짝 큰 구를 가산 혼합 반투명으로 깔아 은은한 빛무리 */}
      <mesh>
        <sphereGeometry args={[2.6, 32, 32]} />
        <meshBasicMaterial
          color={colors.moonGlow}
          transparent
          opacity={0.12}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
