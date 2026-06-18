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
  /**
   * 부모의 '바깥 기저'(원점→부모 = n, 접선 u, w) 기준 좌표 (a,b,c).
   * 매 step에서 부모의 '현재' 바깥 기저로 다시 월드 오프셋을 만든다 →
   * 부모(목표)가 이동해도 자식이 항상 원점 반대 방향을 유지한다.
   */
  local: Vector3;
}
interface SimEdge {
  a: number;
  b: number;
}

/** 자식이 부모 기준 자리(콘)로 복귀하는 스프링 세기. */
const K_HOME = 4;
/** 프레임당 속도 감쇠(0~1). */
const DAMP = 0.95;

const UP = new Vector3(0, 1, 0);
const RIGHT = new Vector3(1, 0, 0);

/**
 * 가벼운 스프링 시뮬레이션.
 * - 달: 원점 고정.
 * - 목표: 복귀력 없음 → 드래그로만 이동하고 그 자리에 멈춘다(돌아오지 않음).
 * - 할일·노트: 부모의 '현재 바깥 방향(원점 반대)' 기저로 재구성한 자리로 복귀 →
 *   부모를 끌면 통째로 따라오고, 옮긴 위치에서도 항상 원점 반대쪽으로 콘이 유지된다.
 * - 링크(edges)는 선을 그리기 위한 것이며 힘으로는 작용하지 않는다.
 */
export class GraphSim {
  nodes: SimNode[] = [];
  edges: SimEdge[] = [];
  index = new Map<string, number>();
  readonly signature: string;
  private tmp = new Vector3();
  private bn = new Vector3();
  private bu = new Vector3();
  private bw = new Vector3();

  static signatureOf(layout: GraphLayout): string {
    return [
      ...layout.goals.map((g) => `g${g.id}`),
      ...layout.todos.map((t) => `t${t.id}`),
      ...layout.notes.map((n) => `n${n.todoId}.${n.id}`),
    ].join('|');
  }

  /** pos의 '바깥 기저'(원점→pos = n, 접선 u, w)를 out 벡터들에 채운다. */
  private basis(pos: Vector3, outN: Vector3, outU: Vector3, outW: Vector3) {
    outN.copy(pos);
    const len = outN.length();
    if (len > 1e-6) outN.multiplyScalar(1 / len);
    else outN.set(0, 0, 1);
    outU
      .copy(outN)
      .cross(Math.abs(outN.y) < 0.99 ? UP : RIGHT)
      .normalize();
    outW.copy(outN).cross(outU);
  }

  constructor(layout: GraphLayout) {
    const v = (p: readonly [number, number, number]) => new Vector3(p[0], p[1], p[2]);
    const push = (key: string, p: readonly [number, number, number], fixed: boolean, parent: number | null) => {
      const pos = v(p);
      const local = new Vector3();
      // 자식: 초기 오프셋을 '초기 부모 바깥 기저'로 분해해 (a,b,c)로 저장.
      if (parent !== null) {
        const parentPos = this.nodes[parent].pos;
        this.basis(parentPos, this.bn, this.bu, this.bw);
        const off = pos.clone().sub(parentPos);
        local.set(off.dot(this.bn), off.dot(this.bu), off.dot(this.bw));
      }
      this.index.set(key, this.nodes.length);
      this.nodes.push({ key, pos, vel: new Vector3(), force: new Vector3(), fixed, parent, local });
    };

    push('moon', layout.moon, true, null);
    layout.goals.forEach((g) => push(`goal-${g.id}`, g.position, false, null));
    layout.todos.forEach((t) => {
      const parent = this.index.get(`goal-${t.goalId}`);
      if (parent === undefined) return;
      push(`todo-${t.id}`, t.position, false, parent);
    });
    layout.notes.forEach((n) => {
      const parent = this.index.get(`todo-${n.todoId}`);
      if (parent === undefined) return;
      push(`note-${n.todoId}-${n.id}`, n.position, false, parent);
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
    const { nodes, tmp, bn, bu, bw } = this;
    for (const n of nodes) n.force.set(0, 0, 0);

    // 자식: 부모의 '현재 바깥 기저'로 오프셋을 재구성한 자리로 복귀(원점 반대 방향 유지).
    for (const n of nodes) {
      if (n.parent === null) continue;
      const parent = nodes[n.parent];
      this.basis(parent.pos, bn, bu, bw);
      tmp
        .set(0, 0, 0)
        .addScaledVector(bn, n.local.x)
        .addScaledVector(bu, n.local.y)
        .addScaledVector(bw, n.local.z)
        .add(parent.pos)
        .sub(n.pos)
        .multiplyScalar(K_HOME);
      n.force.add(tmp);
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
