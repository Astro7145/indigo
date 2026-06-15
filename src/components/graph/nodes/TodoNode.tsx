'use client';

import { useState } from 'react';
import { Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { GRAPH_COLORS } from '@/src/components/graph/palette';
import type { Vec3 } from '@/src/utils/graphLayout';

interface TodoNodeProps {
  position: Vec3;
  title: string;
  done: boolean;
  onClick: () => void;
}

/** 할일 = 작은 별. 클릭 시 할일 상세 시트. done이면 차분한 색. */
export default function TodoNode({ position, title, done, onClick }: TodoNodeProps) {
  const [hovered, setHovered] = useState(false);
  const color = done ? GRAPH_COLORS.todoDone : GRAPH_COLORS.todo;

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
      <mesh scale={hovered ? 0.5 : 0.38} onPointerOver={over} onPointerOut={out} onClick={click}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 1.6 : done ? 0.5 : 1} />
      </mesh>
      {hovered && (
        <Html center distanceFactor={18} className="pointer-events-none">
          <span className="rounded bg-indigo-900/80 px-2 py-1 text-xs whitespace-nowrap text-indigo-100">{title}</span>
        </Html>
      )}
    </group>
  );
}
