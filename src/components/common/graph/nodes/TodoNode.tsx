'use client';

import { useState } from 'react';
import { Html, useCursor } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { GRAPH_COLORS } from '@/src/components/common/graph/palette';
import { useTwinkle } from '@/src/components/common/graph/useTwinkle';

interface TodoNodeProps {
  title: string;
  done: boolean;
  /** 트윙클 위상 시드(노드마다 깜빡임을 어긋나게) — 보통 할일 id. */
  seed: number;
  /** 드래그 시작(부모가 이동/탭 구분을 처리). */
  onPointerDown: (e: ThreeEvent<PointerEvent>) => void;
}

/** 할일 = 작은 별. 끌어서 이동, 짧게 탭하면 상세 시트(부모가 처리). done이면 차분한 색. */
export default function TodoNode({ title, done, seed, onPointerDown }: TodoNodeProps) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered, 'grab'); // 언마운트 시 커서 정리까지 drei가 처리
  const color = done ? GRAPH_COLORS.todoDone : GRAPH_COLORS.todo;
  // done은 더 차분하게(낮은 진폭) 깜빡인다.
  const matRef = useTwinkle(hovered ? 1.6 : done ? 0.5 : 1, seed, done ? 0.15 : 0.35);

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
  };
  const out = () => setHovered(false);

  return (
    <>
      <mesh scale={hovered ? 0.5 : 0.38} onPointerOver={over} onPointerOut={out} onPointerDown={onPointerDown}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshStandardMaterial ref={matRef} color={color} emissive={color} emissiveIntensity={done ? 0.5 : 1} />
      </mesh>
      {hovered && (
        <Html center distanceFactor={18} className="pointer-events-none">
          <span className="rounded bg-indigo-900/80 px-2 py-1 text-xs whitespace-nowrap text-indigo-100">{title}</span>
        </Html>
      )}
    </>
  );
}
