import type { GoalListItem } from '@/src/types/goal';
import type { Todo } from '@/src/types/todo';

export type Vec3 = [number, number, number];

export interface GoalLayoutNode {
  id: number;
  position: Vec3;
  /** 노드 크기 배수(목표는 균일) */
  size: number;
}
export interface TodoLayoutNode {
  id: number;
  goalId: number;
  position: Vec3;
}
export interface NoteLayoutNode {
  /** 노트 id (todo.noteIds 원소) */
  id: number;
  todoId: number;
  position: Vec3;
}
export interface GraphLayout {
  moon: Vec3;
  goals: GoalLayoutNode[];
  todos: TodoLayoutNode[];
  notes: NoteLayoutNode[];
  /** [부모, 자식] 좌표 쌍 — 달→목표, 목표→할일, 할일→노트 */
  links: [Vec3, Vec3][];
}

/** 궤도 반경(월드 단위) */
export const R_GOAL = 10;
export const R_TODO = 3.5;
export const R_NOTE = 0.7;

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** 단위 구면 균등 분포(피보나치 구)의 i번째 점 — 항상 길이 1 */
function fibonacciSpherePoint(i: number, n: number): Vec3 {
  const y = n === 1 ? 0.2 : 1 - (i / (n - 1)) * 2; // 1 → -1
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = GOLDEN_ANGLE * i;
  return [Math.cos(theta) * r, y, Math.sin(theta) * r];
}

function add(base: Vec3, off: Vec3): Vec3 {
  return [base[0] + off[0], base[1] + off[1], base[2] + off[2]];
}

/** 단위 벡터로 정규화(0 벡터는 그대로 취급). */
function unit(v: Vec3): Vec3 {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

/** n에 수직인 단위 벡터(콘을 펼칠 접선축). */
function perpendicular(n: Vec3): Vec3 {
  const up: Vec3 = Math.abs(n[1]) < 0.99 ? [0, 1, 0] : [1, 0, 0];
  return unit([n[1] * up[2] - n[2] * up[1], n[2] * up[0] - n[0] * up[2], n[0] * up[1] - n[1] * up[0]]);
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

/**
 * 바깥축 n을 중심으로 count개를 원뿔(콘)로 펼친 i번째 단위 방향(해바라기 분포).
 * n·cos(θ) + (접선축 u,w로 만든 방위)·sin(θ). θ는 축에서의 벌어짐, 방위각은 황금각.
 */
const CONE_HALF = 1.0; // 콘 반각(rad) ≈ 57°
function coneDirection(n: Vec3, u: Vec3, w: Vec3, i: number, count: number): Vec3 {
  if (count <= 1) return n;
  const theta = Math.sqrt((i + 0.5) / count) * CONE_HALF; // 면적 균등(가운데가 덜 몰리게)
  const phi = i * GOLDEN_ANGLE;
  const st = Math.sin(theta);
  const ct = Math.cos(theta);
  const cp = Math.cos(phi);
  const sp = Math.sin(phi);
  return [
    ct * n[0] + st * (cp * u[0] + sp * w[0]),
    ct * n[1] + st * (cp * u[1] + sp * w[1]),
    ct * n[2] + st * (cp * u[2] + sp * w[2]),
  ];
}

/** 목표마다 중심까지의 거리를 다르게 — golden-ratio 소수부로 deterministic하게 분산(R_GOAL의 0.7~1.3배). */
function goalRadius(i: number): number {
  const t = (i * 0.61803398875) % 1; // 0~1 균등 분산
  return R_GOAL * (0.7 + 0.6 * t);
}

/**
 * 목표·할일·노트를 궤도형 3D 좌표로 배치(deterministic).
 * - 달: 원점 / 목표: 달 주위 피보나치 구(목표마다 거리 다름) / 할일: 목표에서 바깥(원점 반대)으로 R_TODO 원뿔 / 노트: 할일에서 바깥으로 R_NOTE 원뿔
 * - goalId가 null이거나 목표 목록에 없는 할일은 제외.
 */
export function computeGraphLayout(goals: GoalListItem[], todos: Todo[]): GraphLayout {
  const moon: Vec3 = [0, 0, 0];
  const n = goals.length;

  const goalNodes: GoalLayoutNode[] = goals.map((g, i) => {
    const u = fibonacciSpherePoint(i, n);
    const radius = goalRadius(i);
    return {
      id: g.id,
      // 거리는 목표마다 다르게(goalRadius), 크기는 할일 수와 무관하게 균일(부해 보이지 않도록)
      position: [u[0] * radius, u[1] * radius, u[2] * radius],
      size: 0.85,
    };
  });
  const goalPosById = new Map(goalNodes.map((g) => [g.id, g.position] as const));

  const todosByGoal = new Map<number, Todo[]>();
  for (const t of todos) {
    if (t.goalId == null || !goalPosById.has(t.goalId)) continue;
    const arr = todosByGoal.get(t.goalId) ?? [];
    arr.push(t);
    todosByGoal.set(t.goalId, arr);
  }

  const todoNodes: TodoLayoutNode[] = [];
  const noteNodes: NoteLayoutNode[] = [];
  const links: [Vec3, Vec3][] = [];

  goalNodes.forEach((goalNode) => {
    links.push([moon, goalNode.position]);
    // 완료(done)를 앞쪽에 모아 정렬 → 고리에서 밝은 할일이 연속된 호로 보여 진행도가 자연스럽게 읽힌다.
    const list = (todosByGoal.get(goalNode.id) ?? []).slice().sort((a, b) => Number(b.done) - Number(a.done));
    const m = list.length;
    // 목표의 '바깥'(원점 반대) 방향과 접선 기저(u, w) — 할일을 그쪽으로 원뿔로 편다.
    const gOut = unit(goalNode.position);
    const gU = perpendicular(gOut);
    const gW = cross(gOut, gU);
    list.forEach((t, ti) => {
      const dir = coneDirection(gOut, gU, gW, ti, m);
      const position = add(goalNode.position, [dir[0] * R_TODO, dir[1] * R_TODO, dir[2] * R_TODO]);
      todoNodes.push({ id: t.id, goalId: goalNode.id, position });
      links.push([goalNode.position, position]);

      const noteIds = t.noteIds ?? [];
      const k = noteIds.length;
      // 노트도 할일에서 '바깥'(원점 반대) 방향으로 원뿔.
      const tOut = unit(position);
      const tU = perpendicular(tOut);
      const tW = cross(tOut, tU);
      noteIds.forEach((noteId, ni) => {
        const ndir = coneDirection(tOut, tU, tW, ni, k);
        const notePos = add(position, [ndir[0] * R_NOTE, ndir[1] * R_NOTE, ndir[2] * R_NOTE]);
        noteNodes.push({ id: noteId, todoId: t.id, position: notePos });
        links.push([position, notePos]);
      });
    });
  });

  return { moon, goals: goalNodes, todos: todoNodes, notes: noteNodes, links };
}
