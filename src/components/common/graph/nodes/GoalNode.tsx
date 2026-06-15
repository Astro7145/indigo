'use client';

import { useState } from 'react';
import { Html, useCursor } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { getGraphColors } from '@/src/components/common/graph/palette';

interface GoalNodeProps {
  size: number;
  title: string;
  /** 드래그 시작(부모가 이동/탭 구분을 처리). */
  onPointerDown: (e: ThreeEvent<PointerEvent>) => void;
}

/** 목표 = 큰 발광 구. 끌어서 이동, 짧게 탭하면 목표상세 확인 모달(부모가 처리). */
export default function GoalNode({ size, title, onPointerDown }: GoalNodeProps) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered, 'grab'); // 언마운트 시 커서 정리까지 drei가 처리
  const colors = getGraphColors();

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
  };
  const out = () => setHovered(false);

  return (
    <>
      <mesh scale={hovered ? size * 1.25 : size} onPointerOver={over} onPointerOut={out} onPointerDown={onPointerDown}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={colors.goal} toneMapped={false} />
      </mesh>
      {hovered && (
        <Html center distanceFactor={24} className="pointer-events-none">
          <span className="rounded bg-indigo-900/80 px-2 py-1 text-xs font-medium whitespace-nowrap text-indigo-100">
            {title}
          </span>
        </Html>
      )}
    </>
  );
}
