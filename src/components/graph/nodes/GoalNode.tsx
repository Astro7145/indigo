'use client';

import { useState } from 'react';
import { Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { GRAPH_COLORS } from '@/src/components/graph/palette';
import type { Vec3 } from '@/src/utils/graphLayout';

interface GoalNodeProps {
  position: Vec3;
  size: number;
  title: string;
  onClick: () => void;
}

/** 목표 = 행성/큰 별. 클릭 시 목표상세로 이동. */
export default function GoalNode({ position, size, title, onClick }: GoalNodeProps) {
  const [hovered, setHovered] = useState(false);

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };
  const out = () => {
    setHovered(false);
    document.body.style.cursor = 'default';
  };
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <group position={position}>
      <mesh scale={hovered ? size * 1.25 : size} onPointerOver={over} onPointerOut={out} onClick={click}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={GRAPH_COLORS.goal}
          emissive={GRAPH_COLORS.goal}
          emissiveIntensity={hovered ? 1.4 : 0.7}
        />
      </mesh>
      {hovered && (
        <Html center distanceFactor={24} className="pointer-events-none">
          <span className="rounded bg-indigo-900/80 px-2 py-1 text-xs font-medium whitespace-nowrap text-indigo-100">
            {title}
          </span>
        </Html>
      )}
    </group>
  );
}
