jest.mock('@/src/api/todo', () => ({
  ...jest.requireActual('@/src/api/todo'),
  getAllTodos: jest.fn(),
}));
jest.mock('@/src/api/goal', () => ({
  ...jest.requireActual('@/src/api/goal'),
  getAllGoals: jest.fn(),
}));
jest.mock('@/src/api/user', () => ({
  ...jest.requireActual('@/src/api/user'),
  getMe: jest.fn(),
}));

jest.mock('@/src/components/todo/TodoDetailSheet', () => ({
  __esModule: true,
  default: ({ isOpen, todo }: { isOpen: boolean; todo: { title: string } | null }) =>
    isOpen && todo ? <div data-testid="detail-sheet">{todo.title}</div> : null,
}));
jest.mock('@/src/components/todo/TodoFormSheet', () => ({
  __esModule: true,
  default: (props: { isOpen: boolean; mode: string; defaultDueDate?: string; defaultGoalId?: number }) =>
    props.isOpen ? (
      <div data-testid="form-sheet" data-due={props.defaultDueDate} data-goal={props.defaultGoalId} />
    ) : null,
}));

import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import * as goalApi from '@/src/api/goal';
import * as todoApi from '@/src/api/todo';
import * as userApi from '@/src/api/user';
import CalendarView from '@/src/components/todo/calendar/CalendarView';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';
import type { Todo } from '@/src/types/todo';

const mockedTodo = todoApi as jest.Mocked<typeof todoApi>;
const mockedGoal = goalApi as jest.Mocked<typeof goalApi>;
const mockedUser = userApi as jest.Mocked<typeof userApi>;

const makeTodo = (id: number, title: string, overrides?: Partial<Todo>): Todo => ({
  id,
  teamId: 't',
  userId: 1,
  goalId: null,
  title,
  done: false,
  fileUrl: null,
  linkUrl: null,
  dueDate: null,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  goal: null,
  noteIds: [],
  tags: [],
  isFavorite: false,
  ...overrides,
});

/** 항상 "보이는 달"에 들어가도록 오늘 날짜 기반 자정 UTC ISO를 만든다. */
const isoToday = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())).toISOString();
};

beforeEach(() => {
  jest.clearAllMocks();
  mockedUser.getMe.mockResolvedValue({
    id: 1,
    name: '체다치즈',
    email: 'c@c.c',
    createdAt: '',
    updatedAt: '',
  } as never);
  mockedGoal.getAllGoals.mockResolvedValue({
    goals: [{ id: 5, title: '자바스크립트' }],
    nextCursor: null,
    totalCount: 1,
  } as never);
  mockedTodo.getAllTodos.mockResolvedValue({
    todos: [
      makeTodo(1, '오늘 할일', { dueDate: isoToday() }),
      makeTodo(2, '목표 할일', { dueDate: isoToday(), goalId: 5 }),
      makeTodo(3, '날짜 없는 할일'),
    ],
    nextCursor: null,
    totalCount: 3,
  });
});

// 칩(xl)·선택날짜 리스트(<xl)가 CSS로만 분기돼 jsdom에는 둘 다 존재 → *AllBy*로 조회한다.
it('dueDate가 있는 할일만 캘린더에 표시한다', async () => {
  renderWithClient(<CalendarView />);
  expect((await screen.findAllByText('오늘 할일')).length).toBeGreaterThan(0);
  expect(screen.queryAllByText('날짜 없는 할일')).toHaveLength(0);
});

it('목표 필터를 선택하면 해당 목표의 할일만 남는다', async () => {
  const user = userEvent.setup();
  renderWithClient(<CalendarView />);
  await screen.findAllByText('오늘 할일');
  await user.click(screen.getByText('전체 목표'));
  await user.click(await screen.findByText('자바스크립트'));
  await waitFor(() => expect(screen.queryAllByText('오늘 할일')).toHaveLength(0));
  expect(screen.getAllByText('목표 할일').length).toBeGreaterThan(0);
});

it('initialGoalId 프리셋으로 진입하면 해당 목표만 표시한다', async () => {
  renderWithClient(<CalendarView initialGoalId={5} />);
  expect((await screen.findAllByText('목표 할일')).length).toBeGreaterThan(0);
  expect(screen.queryAllByText('오늘 할일')).toHaveLength(0);
});

it('칩을 클릭하면 상세 시트가 열린다', async () => {
  renderWithClient(<CalendarView />);
  fireEvent.click((await screen.findAllByText('오늘 할일'))[0]);
  expect(screen.getByTestId('detail-sheet')).toHaveTextContent('오늘 할일');
});

it('할 일 추가를 누르면 선택 날짜(기본 오늘)가 프리필된 생성 시트가 열린다', async () => {
  renderWithClient(<CalendarView />);
  await screen.findAllByText('오늘 할일');
  fireEvent.click(screen.getAllByRole('button', { name: /할 일 추가/ })[0]);
  const sheet = screen.getByTestId('form-sheet');
  expect(sheet.getAttribute('data-due')).toMatch(/^\d{4}-\d{2}-\d{2}T00:00:00/);
});
