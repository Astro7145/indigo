'use client';

import { useRouter } from 'next/navigation';
import { computeGraphLayout } from '@/src/utils/graphLayout';
import { useTodoSheet } from '@/src/hooks/useTodoSheet';
import type { GoalListItem } from '@/src/types/goal';
import type { Todo } from '@/src/types/todo';
import MoonNode from '@/src/components/common/graph/nodes/MoonNode';
import GoalNode from '@/src/components/common/graph/nodes/GoalNode';
import TodoNode from '@/src/components/common/graph/nodes/TodoNode';
import NoteNode from '@/src/components/common/graph/nodes/NoteNode';
import OrbitLink from '@/src/components/common/graph/OrbitLink';

interface GraphSceneProps {
  goals: GoalListItem[];
  todos: Todo[];
}

/**
 * 레이아웃 좌표로 달·목표·할일·노트·링크를 렌더한다. 자동 회전은 하지 않고
 * 카메라 조작(OrbitControls)으로 사용자가 직접 돌린다.
 */
export default function GraphScene({ goals, todos }: GraphSceneProps) {
  const router = useRouter();
  const { openDetail } = useTodoSheet();
  const layout = computeGraphLayout(goals, todos);
  const goalById = new Map(goals.map((g) => [g.id, g] as const));
  const todoById = new Map(todos.map((t) => [t.id, t] as const));

  return (
    <group>
      <MoonNode position={layout.moon} />

      {layout.links.map((link) => (
        <OrbitLink key={`${link[0].join()}|${link[1].join()}`} from={link[0]} to={link[1]} />
      ))}

      {layout.goals.map((g) => {
        const goal = goalById.get(g.id);
        if (!goal) return null;
        return (
          <GoalNode
            key={g.id}
            position={g.position}
            size={g.size}
            title={goal.title}
            onClick={() => router.push(`/goals/${goal.id}`)}
          />
        );
      })}

      {layout.todos.map((t) => {
        const todo = todoById.get(t.id);
        if (!todo) return null;
        return (
          <TodoNode
            key={t.id}
            position={t.position}
            title={todo.title}
            done={todo.done}
            onClick={() => openDetail(todo)}
          />
        );
      })}

      {layout.notes.map((n) => (
        <NoteNode key={`${n.todoId}-${n.id}`} position={n.position} />
      ))}
    </group>
  );
}
