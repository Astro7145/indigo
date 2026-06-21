'use client';

import { useState } from 'react';
import { useCursor } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { getGraphColors } from '@/src/components/common/graph/palette';

interface NoteNodeProps {
  /** 드래그 시작(부모가 이동/탭 구분을 처리). 짧게 탭하면 노트 드로어가 열린다. */
  onPointerDown: (e: ThreeEvent<PointerEvent>) => void;
}

/** 노트 = 작은 발광 구. 호버 시 커지고, 끌어서 이동·짧게 탭하면 노트 드로어(부모가 처리). 부모 할일을 따라 움직인다. */
export default function NoteNode({ onPointerDown }: NoteNodeProps) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered, 'grab'); // 언마운트 시 커서 정리까지 drei가 처리
  const colors = getGraphColors();

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
  };
  const out = () => setHovered(false);

  return (
    <mesh scale={hovered ? 0.24 : 0.18} onPointerOver={over} onPointerOut={out} onPointerDown={onPointerDown}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color={colors.note} toneMapped={false} />
    </mesh>
  );
}
