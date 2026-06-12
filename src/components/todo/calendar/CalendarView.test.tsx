const mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}));

const mockOpenCreate = jest.fn();
const mockOpenEdit = jest.fn();
const mockOpenDetail = jest.fn();
jest.mock('@/src/hooks/useTodoSheet', () => ({
  useTodoSheet: () => ({ openCreate: mockOpenCreate, openEdit: mockOpenEdit, openDetail: mockOpenDetail }),
}));
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

import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getLocalTimeZone, startOfMonth, startOfWeek, today } from '@internationalized/date';

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
  mockSearchParams.delete('goalId');
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
      makeTodo(4, '빈 날짜 할일', { dueDate: '' }),
    ],
    nextCursor: null,
    totalCount: 3,
  });
});

// 칩(xl)·선택날짜 리스트(<xl)가 CSS로만 분기돼 jsdom에는 둘 다 존재 → *AllBy*로 조회한다.
it('보이는 달의 그리드 범위(from/to)로 조회하고 dueDate 없는 할일은 방어적으로 거른다', async () => {
  renderWithClient(<CalendarView />);
  expect((await screen.findAllByText('오늘 할일')).length).toBeGreaterThan(0);
  expect(mockedTodo.getAllTodos).toHaveBeenCalledWith(
    expect.objectContaining({
      from: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      to: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    }),
  );
  expect(screen.queryAllByText('날짜 없는 할일')).toHaveLength(0);
  expect(screen.queryAllByText('빈 날짜 할일')).toHaveLength(0);
});

it('목표 필터를 선택하면 해당 목표의 할일만 남는다', async () => {
  const user = userEvent.setup();
  renderWithClient(<CalendarView />);
  await screen.findAllByText('오늘 할일');
  await user.click(screen.getByText('전체 목표'));
  await user.click(await screen.findByText('자바스크립트'));
  await waitFor(() => expect(screen.queryAllByText('오늘 할일')).toHaveLength(0));
  expect(screen.getAllByText('목표 할일').length).toBeGreaterThan(0);
  // 필터 변경이 URL에 셸로우 반영된다 (새로고침/공유 시 보존)
  expect(window.location.search).toBe('?goalId=5');
});

it('goalId 쿼리로 진입하면 해당 목표만 표시한다', async () => {
  mockSearchParams.set('goalId', '5');
  renderWithClient(<CalendarView />);
  expect((await screen.findAllByText('목표 할일')).length).toBeGreaterThan(0);
  expect(screen.queryAllByText('오늘 할일')).toHaveLength(0);
});

it('뒤로가기 등으로 URL의 goalId가 바뀌면 필터가 따라간다', async () => {
  const { rerender } = renderWithClient(<CalendarView />);
  await screen.findAllByText('오늘 할일');
  mockSearchParams.set('goalId', '5');
  rerender(<CalendarView />);
  await waitFor(() => expect(screen.queryAllByText('오늘 할일')).toHaveLength(0));
  expect(screen.getAllByText('목표 할일').length).toBeGreaterThan(0);
});

it('칩을 클릭하면 상세 시트가 열린다', async () => {
  renderWithClient(<CalendarView />);
  fireEvent.click((await screen.findAllByText('오늘 할일'))[0]);
  expect(mockOpenDetail.mock.calls[0][0]).toMatchObject({ title: '오늘 할일' });
});

it('월 이동으로 선택 날짜가 그리드 범위를 벗어나면 범위 안으로 클램프된다', async () => {
  renderWithClient(<CalendarView />);
  await screen.findAllByText('오늘 할일');
  // 두 달 이동 — 오늘은 어떤 날짜여도 +2개월 그리드 범위 밖이라 클램프가 항상 발생한다.
  fireEvent.click(screen.getByRole('button', { name: '다음 달' }));
  fireEvent.click(screen.getByRole('button', { name: '다음 달' }));
  const expected = startOfWeek(startOfMonth(today(getLocalTimeZone()).add({ months: 2 })), 'en-US', 'mon');
  const pad = (n: number) => String(n).padStart(2, '0');
  expect(
    await screen.findByRole('heading', { name: `${expected.year}. ${pad(expected.month)}. ${pad(expected.day)}` }),
  ).toBeInTheDocument();
});

it('할 일 추가를 누르면 선택 날짜(기본 오늘)가 프리필된 생성 시트가 열린다', async () => {
  renderWithClient(<CalendarView />);
  await screen.findAllByText('오늘 할일');
  fireEvent.click(screen.getAllByRole('button', { name: /할 일 추가/ })[0]);
  expect(mockOpenCreate.mock.calls[0][0].dueDate).toMatch(/^\d{4}-\d{2}-\d{2}T00:00:00/);
});
