'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useRouter } from 'next/navigation';
import { Group, Plane, Raycaster, Vector2, Vector3, type BufferGeometry } from 'three';
import { computeGraphLayout } from '@/src/utils/graphLayout';
import { useTodoSheet } from '@/src/hooks/useTodoSheet';
import { useNoteDrawer } from '@/src/hooks/note/useNoteDrawer';
import { useIsMobile } from '@/src/hooks/useIsMobile';
import { useModalStore } from '@/src/stores/modal';
import { GraphSim } from '@/src/components/common/graph/graphPhysics';
import { getGraphColors } from '@/src/components/common/graph/palette';
import GoalNavConfirm from '@/src/components/common/graph/GoalNavConfirm';
import MoonNode from '@/src/components/common/graph/nodes/MoonNode';
import GoalNode from '@/src/components/common/graph/nodes/GoalNode';
import TodoNode from '@/src/components/common/graph/nodes/TodoNode';
import NoteNode from '@/src/components/common/graph/nodes/NoteNode';
import type { GoalListItem } from '@/src/types/goal';
import type { Todo } from '@/src/types/todo';

interface GraphSceneProps {
  goals: GoalListItem[];
  todos: Todo[];
  /** 좌상단 토글 — true면 모든 목표 라벨을 호버와 무관하게 항상 표시. */
  showAllGoalLabels: boolean;
  /** 좌상단 토글 — true면 모든 할일 라벨을 호버와 무관하게 항상 표시. */
  showAllTodoLabels: boolean;
}

/** 시뮬레이션의 라이브 위치로 링크 선을 매 프레임 갱신한다(단일 lineSegments, 버퍼는 ref로 변형). */
function PhysicsLinks({ sim }: { sim: GraphSim }) {
  const geomRef = useRef<BufferGeometry>(null);
  const colors = getGraphColors();
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
      <lineBasicMaterial color={colors.link} transparent opacity={0.35} />
    </lineSegments>
  );
}

/**
 * 레이아웃 좌표를 홈으로 삼아 달·목표·할일·노트·링크를 렌더하고, 가벼운 스프링 시뮬레이션으로
 * 노드를 움직인다. 노드를 끌면 포인터 평면에 고정되고 이웃이 유기적으로 따라오며, 놓으면 궤도로 복귀.
 * 짧은 탭은 클릭(목표상세/할일상세), 드래그는 이동으로 구분한다.
 * (데이터 구성이 바뀌면 부모가 key로 리마운트해 시뮬레이션을 새로 만든다.)
 */
/** 0~1 진행도(완료/전체). 전체 할일이 없으면 0. */
function ratio(done: number, total: number): number {
  return total > 0 ? done / total : 0;
}

// 터치 탭은 pointerup 직후 같은 좌표에서 합성 click(ghost click)을 한 번 더 발생시킨다(마우스엔 없음).
// 노드 탭이 연 모달/시트의 백드롭에 이 click이 떨어지면 오버레이가 즉시 닫힌다. 탭 좌표 근처의
// '다음 click 한 번'만 캡처 단계에서 삼켜 막는다(다른 위치의 의도된 클릭은 통과). 안 오면 타이머로 정리.
function suppressGhostClick(x: number, y: number) {
  const swallow = (e: MouseEvent) => {
    window.removeEventListener('click', swallow, true);
    if (Math.hypot(e.clientX - x, e.clientY - y) <= 8) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  };
  window.addEventListener('click', swallow, true);
  setTimeout(() => window.removeEventListener('click', swallow, true), 350);
}

export default function GraphScene({ goals, todos, showAllGoalLabels, showAllTodoLabels }: GraphSceneProps) {
  const router = useRouter();
  const { openDetail } = useTodoSheet();
  const { openNote } = useNoteDrawer();
  const openModal = useModalStore((s) => s.open);
  // 라벨 위/아래 판정은 여기서 한 번만 — 노드마다 useIsMobile을 호출하면 matchMedia 리스너가 중복 등록된다.
  const isMobile = useIsMobile();

  // 전체 진행도(달) — 모든 목표의 완료/전체 합계.
  const overallProgress = ratio(
    goals.reduce((s, g) => s + g.completedCount, 0),
    goals.reduce((s, g) => s + g.todoCount, 0),
  );

  // 목표 노드 탭 — 바로 이동하지 않고 확인 모달을 한 번 띄운다(뎁스 추가).
  const confirmGoalNav = (goalId: number, goalTitle: string) => {
    return openModal(
      (c) => (
        <GoalNavConfirm
          goalTitle={goalTitle}
          onCancel={c.close}
          onConfirm={() => {
            c.closeAndNavigate(() => router.replace(`/goals/${goalId}`));
          }}
        />
      ),
      { variant: 'modal' },
    );
  };
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

  // key의 노드를 잡아 드래그 시작(상태만 세팅). action은 탭(클릭) 시 실행할 동작.
  // 추적·종료 리스너는 아래 effect가 캔버스에 상시 등록한다.
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
  };

  // 드래그 추적·종료 리스너를 캔버스에 한 번 등록하고 언마운트 시 해제한다.
  // pointerup은 탭/이동을 구분해 액션을 실행하고, pointercancel(터치 제스처·OS 인터럽트)은 액션 없이 상태만 정리한다.
  // 이 정리가 없으면 끌던 노드가 포인터에 붙은 채 멈추고 카메라 회전이 잠긴다.
  useEffect(() => {
    const el = gl.domElement;
    const enableControls = (enabled: boolean) => {
      const c = controlsRef.current as unknown as { enabled: boolean } | null;
      if (c) c.enabled = enabled;
    };
    const onMove = (ev: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const rect = el.getBoundingClientRect();
      ndc.current.set(
        ((ev.clientX - rect.left) / rect.width) * 2 - 1,
        -((ev.clientY - rect.top) / rect.height) * 2 + 1,
      );
      ray.current.setFromCamera(ndc.current, camera);
      ray.current.ray.intersectPlane(plane.current, d.target);
      if (Math.hypot(ev.clientX - downXY.current.x, ev.clientY - downXY.current.y) > 4) moved.current = true;
    };
    // tap=true(놓음)면 거의 안 움직였을 때 액션 실행, tap=false(취소)면 액션 없이 정리.
    const end = (ev: PointerEvent, tap: boolean) => {
      if (!drag.current) return;
      el.releasePointerCapture?.(ev.pointerId);
      if (tap && !moved.current && tapAction.current) {
        tapAction.current();
        // 터치 탭이 연 모달/시트를 직후의 합성 click(ghost click)이 백드롭째 닫는 걸 막는다(마우스엔 불필요).
        if (ev.pointerType === 'touch') suppressGhostClick(ev.clientX, ev.clientY);
      }
      drag.current = null;
      tapAction.current = null;
      enableControls(true);
    };
    const onUp = (ev: PointerEvent) => end(ev, true);
    const onCancel = (ev: PointerEvent) => end(ev, false);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onCancel);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onCancel);
      // 드래그 도중 언마운트되면 상태를 비우고 컨트롤을 복구한다.
      if (drag.current) {
        drag.current = null;
        tapAction.current = null;
        enableControls(true);
      }
    };
  }, [gl, camera]);

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
      <MoonNode position={[0, 0, 0]} progress={overallProgress} />
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
              progress={ratio(goal.completedCount, goal.todoCount)}
              isMobile={isMobile}
              showLabel={showAllGoalLabels}
              onPointerDown={grab(key, () => confirmGoalNav(g.id, goal.title))}
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
              isMobile={isMobile}
              showLabel={showAllTodoLabels}
              onPointerDown={grab(key, () => openDetail(todo))}
            />
          </group>
        );
      })}

      {layout.notes.map((n) => {
        const key = `note-${n.todoId}-${n.id}`;
        return (
          <group key={key} ref={setNodeRef(key)} position={n.position}>
            <NoteNode isMobile={isMobile} onPointerDown={grab(key, () => openNote(n.todoId, 'detail'))} />
          </group>
        );
      })}
    </group>
  );
}
