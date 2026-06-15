import { Vector3 } from 'three';
import type { GraphLayout } from '@/src/utils/graphLayout';

interface SimNode {
  key: string;
  pos: Vector3;
  vel: Vector3;
  force: Vector3;
  /** 고정 노드(달) — 항상 정지. */
  fixed: boolean;
  /** 부모 인덱스(자식만). null이면 복귀력 없음(달·목표). */
  parent: number | null;
  /** 부모 기준 초기 오프셋(자식만) — 부모를 따라 이동하는 상대 home. */
  offset: Vector3;
}
interface SimEdge {
  a: number;
  b: number;
}

/** 자식이 부모 기준 자리(고리)로 복귀하는 스프링 세기. */
const K_HOME = 4;
/** 프레임당 속도 감쇠(0~1). */
const DAMP = 0.84;

/**
 * 가벼운 스프링 시뮬레이션.
 * - 달: 원점 고정.
 * - 목표: 복귀력 없음 → 드래그로만 이동하고 그 자리에 멈춘다(돌아오지 않음).
 * - 할일·노트: 부모(목표/할일) "현재 위치 + 초기 오프셋"으로 복귀 → 부모를 끌면 통째로 따라오고,
 *   놓은 뒤에도 부모의 최종 위치로 정렬된다(고리 배치 유지). 단독으로 끌면 제자리(슬롯)로 복귀.
 * - 링크(edges)는 선을 그리기 위한 것이며 힘으로는 작용하지 않는다.
 */
export class GraphSim {
  nodes: SimNode[] = [];
  edges: SimEdge[] = [];
  index = new Map<string, number>();
  readonly signature: string;
  private tmp = new Vector3();

  static signatureOf(layout: GraphLayout): string {
    return [
      ...layout.goals.map((g) => `g${g.id}`),
      ...layout.todos.map((t) => `t${t.id}`),
      ...layout.notes.map((n) => `n${n.todoId}.${n.id}`),
    ].join('|');
  }

  constructor(layout: GraphLayout) {
    const v = (p: readonly [number, number, number]) => new Vector3(p[0], p[1], p[2]);
    const push = (
      key: string,
      p: readonly [number, number, number],
      fixed: boolean,
      parent: number | null,
      offset: Vector3,
    ) => {
      this.index.set(key, this.nodes.length);
      this.nodes.push({ key, pos: v(p), vel: new Vector3(), force: new Vector3(), fixed, parent, offset });
    };

    push('moon', layout.moon, true, null, new Vector3());
    layout.goals.forEach((g) => push(`goal-${g.id}`, g.position, false, null, new Vector3()));
    layout.todos.forEach((t) => {
      const parent = this.index.get(`goal-${t.goalId}`);
      if (parent === undefined) return;
      const offset = v(t.position).sub(this.nodes[parent].pos);
      push(`todo-${t.id}`, t.position, false, parent, offset);
    });
    layout.notes.forEach((n) => {
      const parent = this.index.get(`todo-${n.todoId}`);
      if (parent === undefined) return;
      const offset = v(n.position).sub(this.nodes[parent].pos);
      push(`note-${n.todoId}-${n.id}`, n.position, false, parent, offset);
    });

    const edge = (ka: string, kb: string) => {
      const a = this.index.get(ka);
      const b = this.index.get(kb);
      if (a !== undefined && b !== undefined) this.edges.push({ a, b });
    };
    layout.goals.forEach((g) => edge('moon', `goal-${g.id}`));
    layout.todos.forEach((t) => edge(`goal-${t.goalId}`, `todo-${t.id}`));
    layout.notes.forEach((n) => edge(`todo-${n.todoId}`, `note-${n.todoId}-${n.id}`));

    this.signature = GraphSim.signatureOf(layout);
  }

  /** 한 스텝 적분. drag가 있으면 해당 노드를 target에 고정한다. */
  step(dt: number, drag: { index: number; target: Vector3 } | null) {
    const { nodes, tmp } = this;
    for (const n of nodes) n.force.set(0, 0, 0);

    // 자식만: 부모 현재위치 + 오프셋(상대 home)으로 복귀
    for (const n of nodes) {
      if (n.parent === null) continue; // 달·목표는 복귀력 없음
      tmp.copy(nodes[n.parent].pos).add(n.offset).sub(n.pos).multiplyScalar(K_HOME);
      n.force.add(tmp);
    }

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (n.fixed) continue; // 달
      if (drag && drag.index === i) {
        n.pos.copy(drag.target);
        n.vel.set(0, 0, 0);
        continue;
      }
      n.vel.addScaledVector(n.force, dt).multiplyScalar(DAMP);
      n.pos.addScaledVector(n.vel, dt);
    }
  }
}
