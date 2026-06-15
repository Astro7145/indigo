import { Shape, ShapeGeometry } from 'three';

/** 4갈래 반짝이 별(✦) 평면 shape — 바깥 점 4개(0/90/180/270°), 사이는 중심 쪽으로 오목하게. */
function makeSparkle(): Shape {
  const s = new Shape();
  const outer = 1;
  const pinch = 0.12; // 작을수록 날카로운 별
  s.moveTo(outer, 0);
  for (let i = 0; i < 4; i++) {
    const end = ((i + 1) * Math.PI) / 2;
    const ctrl = (i * Math.PI) / 2 + Math.PI / 4;
    s.quadraticCurveTo(Math.cos(ctrl) * pinch, Math.sin(ctrl) * pinch, Math.cos(end) * outer, Math.sin(end) * outer);
  }
  return s;
}

/** 모든 별 노드(목표·할일)가 공유하는 반짝이 별 지오메트리. 빌보드로 항상 카메라를 향한다. */
export const SPARKLE_GEOMETRY = new ShapeGeometry(makeSparkle());
