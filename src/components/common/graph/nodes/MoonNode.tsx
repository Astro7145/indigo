'use client';

import { Color } from 'three';
import { getGraphColors } from '@/src/components/common/graph/palette';
import ProgressRing from '@/src/components/common/graph/ProgressRing';
import type { Vec3 } from '@/src/utils/graphLayout';

interface MoonNodeProps {
  position: Vec3;
  /** 전체 진행도 0~1 — 밝기와 진행도 링에 반영. */
  progress: number;
}

/** 중앙 달(나) — 자체발광(unlit) 구 + 전체 진행도 링. 진행도만큼 밝아진다. 후광은 Bloom이 만든다. */
export default function MoonNode({ position, progress }: MoonNodeProps) {
  const colors = getGraphColors();
  const color = new Color(colors.moon).multiplyScalar(0.75 + progress * 0.6);
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[1.6, 48, 48]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <ProgressRing nodeRadius={1.6} progress={progress} />
    </group>
  );
}
