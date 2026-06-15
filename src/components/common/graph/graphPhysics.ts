import { Vector3 } from 'three';
import type { GraphLayout } from '@/src/utils/graphLayout';

interface SimNode {
  key: string;
  home: Vector3;
  pos: Vector3;
  vel: Vector3;
  force: Vector3;
  /** 고정 노드(달)는 힘·적분에서 제외된다. */
  fixed: boolean;
}
interface SimEdge {
  a: number;
  b: number;
  rest: number;
}

/** 홈 복귀 스프링 세기 — 궤도(원래 자리)로 끌어당겨 구조를 유지한다. */
const K_HOME = 3.5;
/** 링크(부모-자식) 스프링 세기 — 한 노드를 끌면 이웃이 따라오게 한다. */
const K_LINK = 5;
/** 프레임당 속도 감쇠(0~1) — 출렁임을 가라앉힌다. */
const DAMP = 0.84;

/**
 * 궤도 레이아웃을 홈(anchor)으로 삼는 가벼운 스프링 시뮬레이션.
 * - 각 노드는 홈으로 복귀하려 하고(K_HOME), 부모-자식 링크는 원래 간격을 유지하려 한다(K_LINK).
 * - 드래그 중인 노드는 포인터 위치에 고정되고, 이웃은 링크 스프링으로 유기적으로 따라온다.
 * - 손을 떼면 모두 홈(궤도)으로 부드럽게 복귀한다.
 */
export class GraphSim {
  nodes: SimNode[] = [];
  edges: SimEdge[] = [];
  index = new Map<string, number>();
  readonly signature: string;
  private tmp = new Vector3();

  /** 레이아웃의 노드 구성 시그니처 — 데이터가 바뀌면 시뮬레이션을 새로 만든다. */
  static signatureOf(layout: GraphLayout): string {
    return [
      ...layout.goals.map((g) => `g${g.id}`),
      ...layout.todos.map((t) => `t${t.id}`),
      ...layout.notes.map((n) => `n${n.todoId}.${n.id}`),
    ].join('|');
  }

  constructor(layout: GraphLayout) {
    const add = (key: string, p: readonly [number, number, number], fixed = false) => {
      const home = new Vector3(p[0], p[1], p[2]);
      this.index.set(key, this.nodes.length);
      this.nodes.push({ key, home, pos: home.clone(), vel: new Vector3(), force: new Vector3(), fixed });
    };
    add('moon', layout.moon, true);
    layout.goals.forEach((g) => add(`goal-${g.id}`, g.position));
    layout.todos.forEach((t) => add(`todo-${t.id}`, t.position));
    layout.notes.forEach((n) => add(`note-${n.todoId}-${n.id}`, n.position));

    const link = (ka: string, kb: string) => {
      const a = this.index.get(ka);
      const b = this.index.get(kb);
      if (a === undefined || b === undefined) return;
      this.edges.push({ a, b, rest: this.nodes[a].home.distanceTo(this.nodes[b].home) });
    };
    layout.goals.forEach((g) => link('moon', `goal-${g.id}`));
    layout.todos.forEach((t) => link(`goal-${t.goalId}`, `todo-${t.id}`));
    layout.notes.forEach((n) => link(`todo-${n.todoId}`, `note-${n.todoId}-${n.id}`));

    this.signature = GraphSim.signatureOf(layout);
  }

  /** 한 스텝 적분. drag가 있으면 해당 노드를 target에 고정하고 나머지는 스프링으로 반응한다. */
  step(dt: number, drag: { index: number; target: Vector3 } | null) {
    const { nodes, edges, tmp } = this;
    for (const n of nodes) n.force.set(0, 0, 0);

    for (const n of nodes) {
      if (n.fixed) continue;
      tmp.copy(n.home).sub(n.pos).multiplyScalar(K_HOME);
      n.force.add(tmp);
    }
    for (const e of edges) {
      const a = nodes[e.a];
      const b = nodes[e.b];
      tmp.copy(b.pos).sub(a.pos);
      const len = tmp.length() || 1e-6;
      tmp.multiplyScalar((K_LINK * (len - e.rest)) / len); // 방향 × 세기 × 변위
      if (!a.fixed) a.force.add(tmp);
      if (!b.fixed) b.force.sub(tmp);
    }
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (n.fixed) continue;
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
