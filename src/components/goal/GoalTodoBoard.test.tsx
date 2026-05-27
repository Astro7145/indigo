jest.mock('@/src/api/todo', () => ({
  ...jest.requireActual('@/src/api/todo'),
  getTodos: jest.fn(),
  patchTodo: jest.fn(),
}));
jest.mock('@/src/api/favorite', () => ({
  ...jest.requireActual('@/src/api/favorite'),
  addTodoFavorite: jest.fn(),
  removeTodoFavorite: jest.fn(),
}));
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));

import { screen, within } from '@testing-library/react';

import * as todoApi from '@/src/api/todo';
import GoalTodoBoard from '@/src/components/goal/GoalTodoBoard';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';
import type { GoalListItem } from '@/src/types/goal';
import type { Todo } from '@/src/types/todo';

const mocked = todoApi as jest.Mocked<typeof todoApi>;

const goal: GoalListItem = {
  id: 9,
  teamId: 't',
  userId: 1,
  title: '디자인 시스템 정복하기',
  createdAt: '',
  updatedAt: '',
  todoCount: 4,
  completedCount: 1,
};

const makeTodo = (id: number, title: string, done = false): Todo => ({
  id,
  teamId: 't',
  userId: 1,
  goalId: 9,
  title,
  done,
  fileUrl: null,
  linkUrl: null,
  dueDate: null,
  createdAt: '2026-05-20T00:00:00Z',
  updatedAt: '2026-05-20T00:00:00Z',
  goal: { id: 9, title: '디자인 시스템 정복하기' },
  noteIds: [],
  tags: [],
  isFavorite: false,
});
const listOf = (todos: Todo[]) => ({ todos, nextCursor: null, totalCount: todos.length });

beforeEach(() => jest.resetAllMocks());

it('목표명과 진행률(1/4 → 25%)을 렌더한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([]));
  renderWithClient(<GoalTodoBoard goal={goal} />);
  expect(await screen.findByText('디자인 시스템 정복하기')).toBeInTheDocument();
  expect(screen.getByText('25%')).toBeInTheDocument();
});

it('할일을 done 기준으로 To Do/Done 열에 나눠 렌더한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([makeTodo(1, '미완료 할일'), makeTodo(2, '완료 할일', true)]));
  renderWithClient(<GoalTodoBoard goal={goal} />);
  const todoCol = await screen.findByRole('group', { name: 'To do' });
  const doneCol = screen.getByRole('group', { name: 'Done' });
  expect(within(todoCol).getByText('미완료 할일')).toBeInTheDocument();
  expect(within(doneCol).getByText('완료 할일')).toBeInTheDocument();
});

it('할일이 없으면 빈 UI 메시지를 렌더한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([]));
  renderWithClient(<GoalTodoBoard goal={goal} />);
  expect(await screen.findByText('아직 할 일이 없어요')).toBeInTheDocument();
});
