'use client';

import { getGraphColors } from '@/src/components/common/graph/palette';

/** 노트 = 작은 발광 구. 클릭/연결은 노트 작업 완료 후 추가 예정. 부모 할일을 따라 움직인다. */
export default function NoteNode() {
  // 노트 클릭/연결 지점: 노트 라우트 확정 시 onPointerDown/탭 액션 추가.
  const colors = getGraphColors();
  return (
    <mesh scale={0.18}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial color={colors.note} emissive={colors.note} emissiveIntensity={0.9} />
    </mesh>
  );
}
