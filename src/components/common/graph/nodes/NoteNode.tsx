'use client';

import { useState } from 'react';
import { Billboard, Html, useCursor } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { getGraphColors } from '@/src/components/common/graph/palette';

interface NoteNodeProps {
  /** 모바일이면 라벨을 노드 위로(부모 GraphScene에서 한 번만 판정해 내려준다). */
  isMobile: boolean;
  /** 드래그 시작(부모가 이동/탭 구분을 처리). 짧게 탭하면 노트 드로어가 열린다. */
  onPointerDown: (e: ThreeEvent<PointerEvent>) => void;
}

/** 노트 = 작은 발광 구. 호버 시 커지고, 끌어서 이동·짧게 탭하면 노트 드로어(부모가 처리). 부모 할일을 따라 움직인다. */
export default function NoteNode({ isMobile, onPointerDown }: NoteNodeProps) {
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
      <mesh scale={hovered ? 0.24 : 0.18} onPointerOver={over} onPointerOut={out} onPointerDown={onPointerDown}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={colors.note} toneMapped={false} />
      </mesh>
      {hovered && (
        // 노트는 제목 데이터가 없어 고정 "노트" 라벨. 다른 노드처럼 Billboard로 늘 화면 아래(−Y),
        // 모바일에선 손가락이 노드 아래를 가리므로 위(+Y)로. 노드가 작아 오프셋도 작게.
        // zIndexRange로 라벨 z-index를 30 이하로 묶는다 — 기본(거대값)이면 모달/드로어 위로 떠버린다.
        <Billboard>
          <Html center position={[0, isMobile ? 0.6 : -0.6, 0]} zIndexRange={[30, 0]} className="pointer-events-none">
            <span className="bg-indigo-alpha-30 rounded px-2 py-1 text-xs whitespace-nowrap text-indigo-100">노트</span>
          </Html>
        </Billboard>
      )}
    </>
  );
}
