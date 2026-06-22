'use client';

import { useState } from 'react';
import { Billboard, Html, useCursor } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { Color } from 'three';
import { getGraphColors } from '@/src/components/common/graph/palette';
import { useIsMobile } from '@/src/hooks/useIsMobile';

interface TodoNodeProps {
  title: string;
  done: boolean;
  /** 드래그 시작(부모가 이동/탭 구분을 처리). */
  onPointerDown: (e: ThreeEvent<PointerEvent>) => void;
}

/** 할일 = 작은 발광 구. 완료(Done)면 밝게, 미완료(Todo)면 어둡게. 끌어서 이동, 짧게 탭하면 상세 시트(부모가 처리). */
export default function TodoNode({ title, done, onPointerDown }: TodoNodeProps) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered, 'grab'); // 언마운트 시 커서 정리까지 drei가 처리
  const isMobile = useIsMobile();
  const colors = getGraphColors();
  // done이면 밝게(발광↑), 미완료면 어둡게.
  const color = new Color(colors.todo).multiplyScalar(done ? 1.3 : 0.1);

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
  };
  const out = () => setHovered(false);

  return (
    <>
      <mesh scale={hovered ? 0.5 : 0.38} onPointerOver={over} onPointerOut={out} onPointerDown={onPointerDown}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {hovered && (
        // 라벨을 노드 아래에 띄운다 — Billboard로 '아래(−Y)'가 카메라 각도와 무관하게 늘 화면 아래로 향한다.
        // 모바일에선 터치하는 손가락이 노드 아래를 가리므로 위(+Y)로 띄운다.
        <Billboard>
          <Html center position={[0, isMobile ? 0.8 : -0.8, 0]} className="pointer-events-none">
            <span className="bg-indigo-alpha-30 rounded px-2 py-1 text-xs whitespace-nowrap text-indigo-100">
              {title}
            </span>
          </Html>
        </Billboard>
      )}
    </>
  );
}
