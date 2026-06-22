'use client';

import { useState } from 'react';
import { Billboard, Html, useCursor } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { Color } from 'three';
import { getGraphColors } from '@/src/components/common/graph/palette';

interface GoalNodeProps {
  size: number;
  title: string;
  /** 0~1 진행도(완료/전체 할일) — 구의 발광 밝기에 반영(진행도 자체는 할일 고리로 표현). */
  progress: number;
  /** 모바일이면 라벨을 노드 위로(부모 GraphScene에서 한 번만 판정해 내려준다). */
  isMobile: boolean;
  /** true면 호버와 무관하게 라벨을 항상 표시(좌상단 '목표 이름 모두 보기' 토글). */
  showLabel: boolean;
  /** 드래그 시작(부모가 이동/탭 구분을 처리). */
  onPointerDown: (e: ThreeEvent<PointerEvent>) => void;
}

/** 목표 = 발광 구. 진행도만큼 밝아지고, 진행도 자체는 둘레의 할일 고리(완료=밝음)로 읽는다. 탭하면 목표상세 확인 모달. */
export default function GoalNode({ size, title, progress, isMobile, showLabel, onPointerDown }: GoalNodeProps) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered, 'grab'); // 언마운트 시 커서 정리까지 drei가 처리
  const colors = getGraphColors();
  const color = new Color(colors.goal).multiplyScalar(0.1 + 1.3 * progress);

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
  };
  const out = () => setHovered(false);

  return (
    <>
      <mesh scale={hovered ? size * 1.25 : size} onPointerOver={over} onPointerOut={out} onPointerDown={onPointerDown}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {(hovered || showLabel) && (
        // 라벨을 노드 아래에 띄운다 — Billboard로 항상 카메라를 향하게 해 '아래(−Y)'가 카메라 각도와
        // 무관하게 늘 화면 아래로 가고, 오프셋은 월드 단위라 줌과 상관없이 노드를 항상 비킨다.
        // 모바일에선 터치하는 손가락이 노드 아래를 가리므로 위(+Y)로 띄운다.
        // zIndexRange로 라벨 z-index를 30 이하로 묶는다 — 기본(거대값)이면 모달/드로어 위로 떠버린다.
        <Billboard>
          <Html center position={[0, isMobile ? 1.5 : -1.5, 0]} zIndexRange={[50, 30]} className="pointer-events-none">
            <span className="rounded bg-indigo-900 px-2 py-1 text-xs font-medium whitespace-nowrap text-indigo-100">
              {title}
            </span>
          </Html>
        </Billboard>
      )}
    </>
  );
}
