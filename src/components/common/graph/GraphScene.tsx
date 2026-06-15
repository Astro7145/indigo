'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useRouter } from 'next/navigation';
import { Group, Plane, Raycaster, Vector2, Vector3, type BufferGeometry } from 'three';
import { computeGraphLayout } from '@/src/utils/graphLayout';
import { useTodoSheet } from '@/src/hooks/useTodoSheet';
import { GraphSim } from '@/src/components/common/graph/graphPhysics';
import { GRAPH_COLORS } from '@/src/components/common/graph/palette';
import MoonNode from '@/src/components/common/graph/nodes/MoonNode';
import GoalNode from '@/src/components/common/graph/nodes/GoalNode';
import TodoNode from '@/src/components/common/graph/nodes/TodoNode';
import NoteNode from '@/src/components/common/graph/nodes/NoteNode';
import type { GoalListItem } from '@/src/types/goal';
import type { Todo } from '@/src/types/todo';

interface GraphSceneProps {
  goals: GoalListItem[];
  todos: Todo[];
}

/** 시뮬레이션의 라이브 위치로 링크 선을 매 프레임 갱신한다(단일 lineSegments, 버퍼는 ref로 변형). */
function PhysicsLinks({ sim }: { sim: GraphSim }) {
  const geomRef = useRef<BufferGeometry>(null);
  useFrame(() => {
    const geo = geomRef.current;
    if (!geo) return;
    const arr = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < sim.edges.length; i++) {
      const e = sim.edges[i];
      const a = sim.nodes[e.a].pos;
      const b = sim.nodes[e.b].pos;
      const o = i * 6;
      arr[o] = a.x;
      arr[o + 1] = a.y;
      arr[o + 2] = a.z;
      arr[o + 3] = b.x;
      arr[o + 4] = b.y;
      arr[o + 5] = b.z;
    }
    geo.attributes.position.needsUpdate = true;
  });
  return (
    <lineSegments>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute attach="attributes-position" args={[new Float32Array(sim.edges.length * 6), 3]} />
      </bufferGeometry>
      <lineBasicMaterial color={GRAPH_COLORS.link} transparent opacity={0.35} />
    </lineSegments>
  );
}

/**
 * 레이아웃 좌표를 홈으로 삼아 달·목표·할일·노트·링크를 렌더하고, 가벼운 스프링 시뮬레이션으로
 * 노드를 움직인다. 노드를 끌면 포인터 평면에 고정되고 이웃이 유기적으로 따라오며, 놓으면 궤도로 복귀.
 * 짧은 탭은 클릭(목표상세/할일상세), 드래그는 이동으로 구분한다.
 * (데이터 구성이 바뀌면 부모가 key로 리마운트해 시뮬레이션을 새로 만든다.)
 */
export default function GraphScene({ goals, todos }: GraphSceneProps) {
  const router = useRouter();
  const { openDetail } = useTodoSheet();
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const controls = useThree((s) => s.controls);

  const layout = computeGraphLayout(goals, todos);
  const goalById = new Map(goals.map((g) => [g.id, g] as const));
  const todoById = new Map(todos.map((t) => [t.id, t] as const));

  // 시뮬레이션 인스턴스 — state로 1회 생성(읽기 전용 참조), 매 프레임 변형은 ref 경유로 한다.
  const [sim] = useState(() => new GraphSim(layout));
  const simRef = useRef(sim);

  const groupRefs = useRef(new Map<string, Group>());
  const setNodeRef = (key: string) => (el: Group | null) => {
    if (el) groupRefs.current.set(key, el);
    else groupRefs.current.delete(key);
  };

  // OrbitControls는 마운트 후 채워지므로 ref로 추적해 콜백에서 안전히 토글한다.
  const controlsRef = useRef(controls);
  useEffect(() => {
    controlsRef.current = controls;
  }, [controls]);
  const setControlsEnabled = (enabled: boolean) => {
    const c = controlsRef.current as unknown as { enabled: boolean } | null;
    if (c) c.enabled = enabled;
  };

  // 드래그 상태(리렌더 없이 프레임 루프·핸들러가 읽는다)
  const drag = useRef<{ index: number; target: Vector3 } | null>(null);
  const plane = useRef(new Plane());
  const ray = useRef(new Raycaster());
  const ndc = useRef(new Vector2());
  const downXY = useRef(new Vector2());
  const moved = useRef(false);
  const tapAction = useRef<(() => void) | null>(null);

  const onPointerMove = (ev: PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const rect = gl.domElement.getBoundingClientRect();
    ndc.current.set(((ev.clientX - rect.left) / rect.width) * 2 - 1, -((ev.clientY - rect.top) / rect.height) * 2 + 1);
    ray.current.setFromCamera(ndc.current, camera);
    ray.current.ray.intersectPlane(plane.current, d.target);
    if (Math.hypot(ev.clientX - downXY.current.x, ev.clientY - downXY.current.y) > 4) moved.current = true;
  };

  const onPointerUp = (ev: PointerEvent) => {
    gl.domElement.removeEventListener('pointermove', onPointerMove);
    gl.domElement.removeEventListener('pointerup', onPointerUp);
    gl.domElement.releasePointerCapture?.(ev.pointerId);
    // 거의 움직이지 않았으면 탭(클릭)으로 간주해 액션 실행
    if (!moved.current && tapAction.current) tapAction.current();
    drag.current = null;
    tapAction.current = null;
  };

  // key의 노드를 잡아 드래그 시작. action은 탭(클릭) 시 실행할 동작.
  const grab = (key: string, action: (() => void) | null) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const s = simRef.current;
    const index = s.index.get(key);
    if (index === undefined) return;
    // 카메라를 향하는 평면(노드 통과)에서 포인터를 따라가게 한다.
    const normal = camera.getWorldDirection(new Vector3()).negate();
    plane.current.setFromNormalAndCoplanarPoint(normal, s.nodes[index].pos);
    drag.current = { index, target: s.nodes[index].pos.clone() };
    moved.current = false;
    tapAction.current = action;
    downXY.current.set(e.nativeEvent.clientX, e.nativeEvent.clientY);
    setControlsEnabled(false); // 드래그 중 카메라 회전 방지
    gl.domElement.setPointerCapture?.(e.nativeEvent.pointerId);
    gl.domElement.addEventListener('pointermove', onPointerMove);
    gl.domElement.addEventListener('pointerup', onPointerUp);
  };

  useFrame((_, delta) => {
    const s = simRef.current;
    setControlsEnabled(!drag.current);
    s.step(Math.min(delta, 1 / 30), drag.current);
    for (const n of s.nodes) {
      if (n.fixed) continue;
      const g = groupRefs.current.get(n.key);
      if (g) g.position.copy(n.pos);
    }
  });

  return (
    <group>
      <MoonNode position={[0, 0, 0]} />
      <PhysicsLinks sim={sim} />

      {layout.goals.map((g) => {
        const goal = goalById.get(g.id);
        if (!goal) return null;
        const key = `goal-${g.id}`;
        return (
          <group key={key} ref={setNodeRef(key)} position={g.position}>
            <GoalNode
              size={g.size}
              title={goal.title}
              seed={g.id}
              onPointerDown={grab(key, () => router.push(`/goals/${g.id}`))}
            />
          </group>
        );
      })}

      {layout.todos.map((t) => {
        const todo = todoById.get(t.id);
        if (!todo) return null;
        const key = `todo-${t.id}`;
        return (
          <group key={key} ref={setNodeRef(key)} position={t.position}>
            <TodoNode
              title={todo.title}
              done={todo.done}
              seed={t.id}
              onPointerDown={grab(key, () => openDetail(todo))}
            />
          </group>
        );
      })}

      {layout.notes.map((n) => {
        const key = `note-${n.todoId}-${n.id}`;
        return (
          <group key={key} ref={setNodeRef(key)} position={n.position}>
            <NoteNode seed={n.id} />
          </group>
        );
      })}
    </group>
  );
}
