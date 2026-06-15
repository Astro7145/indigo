'use client';

import { useState } from 'react';
import { Billboard, Html, useCursor } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { getGraphColors } from '@/src/components/common/graph/palette';
import { SPARKLE_GEOMETRY } from '@/src/components/common/graph/sparkleGeometry';
import { useTwinkle } from '@/src/components/common/graph/useTwinkle';

interface GoalNodeProps {
  size: number;
  title: string;
  /** 트윙클 위상 시드(노드마다 깜빡임을 어긋나게) — 보통 목표 id. */
  seed: number;
  /** 드래그 시작(부모가 이동/탭 구분을 처리). */
  onPointerDown: (e: ThreeEvent<PointerEvent>) => void;
}

/** 목표 = 큰 반짝이 별(빌보드 스파클). 끌어서 이동, 짧게 탭하면 목표상세 확인 모달(부모가 처리). */
export default function GoalNode({ size, title, seed, onPointerDown }: GoalNodeProps) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered, 'grab'); // 언마운트 시 커서 정리까지 drei가 처리
  const matRef = useTwinkle(hovered ? 1.6 : 0.9, seed);
  const colors = getGraphColors();

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
  };
  const out = () => setHovered(false);

  return (
    <Billboard>
      <mesh
        geometry={SPARKLE_GEOMETRY}
        scale={hovered ? size * 1.25 : size}
        onPointerOver={over}
        onPointerOut={out}
        onPointerDown={onPointerDown}
      >
        <meshStandardMaterial ref={matRef} color={colors.goal} emissive={colors.goal} emissiveIntensity={0.9} />
      </mesh>
      {hovered && (
        <Html center distanceFactor={24} className="pointer-events-none">
          <span className="rounded bg-indigo-900/80 px-2 py-1 text-xs font-medium whitespace-nowrap text-indigo-100">
            {title}
          </span>
        </Html>
      )}
    </Billboard>
  );
}
