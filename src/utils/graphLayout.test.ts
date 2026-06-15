import { computeGraphLayout, R_GOAL, R_TODO, R_NOTE } from '@/src/utils/graphLayout';
import type { GoalListItem } from '@/src/types/goal';
import type { Todo } from '@/src/types/todo';

function goal(id: number, todoCount = 0): GoalListItem {
  return { id, teamId: 't', userId: 1, title: `g${id}`, createdAt: '', updatedAt: '', todoCount, completedCount: 0 };
}
function todo(id: number, goalId: number | null, noteIds: number[] = []): Todo {
  return {
    id,
    teamId: 't',
    userId: 1,
    goalId,
    title: `t${id}`,
    done: false,
    fileUrl: null,
    linkUrl: null,
    dueDate: null,
    createdAt: '',
    updatedAt: '',
    goal: null,
    noteIds,
    tags: [],
    isFavorite: false,
  };
}
type V = [number, number, number];
const dist = (a: V, b: V) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

it('목표는 모두 노드가 되고 달에서의 거리가 목표마다 다르다(R_GOAL의 0.7~1.3배)', () => {
  const { goals, moon } = computeGraphLayout([goal(1), goal(2), goal(3)], []);
  expect(goals).toHaveLength(3);
  const dists = goals.map((g) => dist(g.position, moon));
  for (const d of dists) {
    expect(d).toBeGreaterThanOrEqual(R_GOAL * 0.7 - 1e-6);
    expect(d).toBeLessThanOrEqual(R_GOAL * 1.3 + 1e-6);
  }
  // 거리가 전부 같지 않아야 한다(목표마다 다름)
  expect(new Set(dists.map((d) => d.toFixed(4))).size).toBeGreaterThan(1);
});

it('할일은 부모 목표에서 R_TODO 거리에 놓인다', () => {
  const layout = computeGraphLayout([goal(1)], [todo(10, 1), todo(11, 1)]);
  expect(layout.todos).toHaveLength(2);
  const gPos = layout.goals[0].position;
  for (const t of layout.todos) expect(dist(t.position, gPos)).toBeCloseTo(R_TODO, 5);
});

it('노트는 부모 할일에서 R_NOTE 거리에 놓이고 noteIds 개수만큼 생성된다', () => {
  const layout = computeGraphLayout([goal(1)], [todo(10, 1, [100, 101])]);
  expect(layout.notes).toHaveLength(2);
  const tPos = layout.todos[0].position;
  for (const n of layout.notes) expect(dist(n.position, tPos)).toBeCloseTo(R_NOTE, 5);
});

it('goalId가 null이거나 목록에 없는 목표의 할일은 제외된다', () => {
  const layout = computeGraphLayout([goal(1)], [todo(10, 1), todo(11, null), todo(12, 999)]);
  expect(layout.todos.map((t) => t.id)).toEqual([10]);
});

it('링크 수는 목표+할일+노트 수의 합과 같다', () => {
  const layout = computeGraphLayout([goal(1), goal(2)], [todo(10, 1, [100]), todo(11, 2)]);
  expect(layout.links).toHaveLength(layout.goals.length + layout.todos.length + layout.notes.length);
});

it('같은 입력은 항상 같은 좌표를 낸다(deterministic)', () => {
  const a = computeGraphLayout([goal(1), goal(2)], [todo(10, 1, [100])]);
  const b = computeGraphLayout([goal(1), goal(2)], [todo(10, 1, [100])]);
  expect(a).toEqual(b);
});
