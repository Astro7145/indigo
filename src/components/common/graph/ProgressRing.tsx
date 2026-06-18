'use client';

import { Billboard } from '@react-three/drei';
import { DoubleSide } from 'three';
import { getGraphColors } from '@/src/components/common/graph/palette';

interface ProgressRingProps {
  /** 감쌀 노드의 반경(월드 단위). */
  nodeRadius: number;
  /** 0~1 진행도. */
  progress: number;
}

/**
 * 노드를 감싸는 unlit 진행도 링(빌보드라 항상 카메라를 향함).
 * 흐린 전체 트랙 + 밝은 진행 호(완료 비율만큼 채워짐).
 */
export default function ProgressRing({ nodeRadius, progress }: ProgressRingProps) {
  const colors = getGraphColors();
  const inner = nodeRadius * 1.12;
  const outer = nodeRadius * 1.2;
  const p = Math.max(0, Math.min(1, progress));

  return (
    <Billboard>
      <mesh>
        <ringGeometry args={[inner, outer, 64]} />
        <meshBasicMaterial color={colors.todo} transparent opacity={0.13} toneMapped={false} side={DoubleSide} />
      </mesh>
      {p > 0 && (
        <mesh>
          {/* 12시에서 시작해 진행도만큼 호를 채운다 */}
          <ringGeometry args={[inner, outer, 64, 1, Math.PI / 2, p * Math.PI * 2]} />
          <meshBasicMaterial color={colors.todo} transparent opacity={0.9} toneMapped={false} side={DoubleSide} />
        </mesh>
      )}
    </Billboard>
  );
}
