'use client';

import { AdditiveBlending } from 'three';
import { getGraphColors } from '@/src/components/common/graph/palette';
import { getStarTexture } from '@/src/components/common/graph/starTexture';
import { useTwinkleOpacity } from '@/src/components/common/graph/useTwinkle';

interface NoteNodeProps {
  /** 트윙클 위상 시드(노드마다 깜빡임을 어긋나게) — 보통 노트 id. */
  seed: number;
}

/** 노트 = 작은 별먼지(글로우 스프라이트). 클릭/연결은 노트 작업 완료 후 추가 예정. 부모 할일을 따라 움직인다. */
export default function NoteNode({ seed }: NoteNodeProps) {
  // 노트 클릭/연결 지점: 노트 라우트 확정 시 onPointerDown/탭 액션 추가.
  const matRef = useTwinkleOpacity(0.45, seed, 0.2);
  const colors = getGraphColors();
  return (
    <sprite scale={0.6}>
      <spriteMaterial
        ref={matRef}
        map={getStarTexture()}
        color={colors.note}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </sprite>
  );
}
