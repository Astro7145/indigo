'use client';

import { useState } from 'react';
import { Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { Color } from 'three';
import { getGraphColors } from '@/src/components/common/graph/palette';
import ProgressRing from '@/src/components/common/graph/ProgressRing';
import type { Vec3 } from '@/src/utils/graphLayout';

interface MoonNodeProps {
  position: Vec3;
  progress: number;
}

/** 중앙 달(나) — 자체발광(unlit) 구 + 전체 진행도 링. 호버하면 전체 진행도 퍼센트를 링과 같은 색(todo 토큰)으로 보여준다. */
export default function MoonNode({ position, progress }: MoonNodeProps) {
  const [hovered, setHovered] = useState(false);
  const colors = getGraphColors();
  const color = new Color(colors.moon).multiplyScalar(0.75 + progress * 0.6);

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
  };
  const out = () => setHovered(false);

  return (
    <group position={position}>
      <mesh onPointerOver={over} onPointerOut={out} onPointerDown={(e) => e.stopPropagation()}>
        <sphereGeometry args={[1.6, 48, 48]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <ProgressRing nodeRadius={1.6} progress={progress} />
      {hovered && (
        // 진행도 링처럼 3D 공간에 박혀 달과 함께 스케일·빌보드(transform sprite)되는 퍼센트.
        // 색은 링과 같은 todo 토큰(indigo-400). pointerEvents="none"으로 라벨이 포인터를 가로채 hover가
        // 깜빡이는 걸 막는다 — className의 pointer-events-none은 drei가 거는 인라인 스타일에 덮이므로 prop으로 줘야 한다.
        <Html transform sprite pointerEvents="none" className="select-none">
          <span className="text-3xl font-semibold whitespace-nowrap text-indigo-400">
            {Math.round(progress * 100)}%
          </span>
        </Html>
      )}
    </group>
  );
}
