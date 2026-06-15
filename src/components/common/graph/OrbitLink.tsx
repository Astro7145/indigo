'use client';

import { Line } from '@react-three/drei';
import { GRAPH_COLORS } from '@/src/components/common/graph/palette';
import type { Vec3 } from '@/src/utils/graphLayout';

/** 부모→자식 노드를 잇는 은은한 발광 선. */
export default function OrbitLink({ from, to }: { from: Vec3; to: Vec3 }) {
  return <Line points={[from, to]} color={GRAPH_COLORS.link} lineWidth={1} transparent opacity={0.35} />;
}
