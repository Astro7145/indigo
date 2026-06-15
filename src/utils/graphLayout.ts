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
export const R_GOAL = 6;
export const R_TODO = 2;
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

/** 목표마다 중심까지의 거리를 다르게 — golden-ratio 소수부로 deterministic하게 분산(R_GOAL의 0.7~1.3배). */
function goalRadius(i: number): number {
  const t = (i * 0.61803398875) % 1; // 0~1 균등 분산
  return R_GOAL * (0.7 + 0.6 * t);
}

/**
 * 목표·할일·노트를 궤도형 3D 좌표로 배치(deterministic).
 * - 달: 원점 / 목표: 달 주위 피보나치 구(목표마다 거리 다름) / 할일: 각 목표 주위 R_TODO 구면 / 노트: 부모 할일 주위 R_NOTE 구면
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
    list.forEach((t, ti) => {
      // 할일을 목표 둘레 고리(평면 링, 목성 위성처럼)에 배치 — |offset| === R_TODO
      const angle = (ti / m) * Math.PI * 2;
      const position = add(goalNode.position, [Math.cos(angle) * R_TODO, 0, Math.sin(angle) * R_TODO]);
      todoNodes.push({ id: t.id, goalId: goalNode.id, position });
      links.push([goalNode.position, position]);

      const noteIds = t.noteIds ?? [];
      const k = noteIds.length;
      noteIds.forEach((noteId, ni) => {
        // 노트도 부모 할일 주위 구면에 3D로 분포 — |offset| === R_NOTE
        const v = fibonacciSpherePoint(ni, k);
        const notePos = add(position, [v[0] * R_NOTE, v[1] * R_NOTE, v[2] * R_NOTE]);
        noteNodes.push({ id: noteId, todoId: t.id, position: notePos });
        links.push([position, notePos]);
      });
    });
  });

  return { moon, goals: goalNodes, todos: todoNodes, notes: noteNodes, links };
}
