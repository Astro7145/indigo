jest.mock('@/src/api/todo', () => ({
  ...jest.requireActual('@/src/api/todo'),
  getTodos: jest.fn(),
  patchTodo: jest.fn(),
  addTodoFavorite: jest.fn(),
  removeTodoFavorite: jest.fn(),
}));

import { fireEvent, screen, waitFor } from '@testing-library/react';

import * as todoApi from '@/src/api/todo';
import RecentTodos from '@/src/components/todo/RecentTodos';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';
import type { Todo } from '@/src/types/todo';

const mocked = todoApi as jest.Mocked<typeof todoApi>;

const makeTodo = (id: number, title: string, done = false): Todo => ({
  id,
  teamId: 't',
  userId: 1,
  goalId: null,
  title,
  done,
  fileUrl: null,
  linkUrl: null,
  dueDate: null,
  createdAt: '2026-05-20T00:00:00Z',
  updatedAt: '2026-05-20T00:00:00Z',
  goal: null,
  noteIds: [],
  tags: [],
  isFavorite: false,
});

const listOf = (todos: Todo[]) => ({
  todos,
  nextCursor: null,
  totalCount: todos.length,
});

beforeEach(() => jest.resetAllMocks());

it('useTodoList 결과의 모든 할일 제목을 렌더한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([makeTodo(1, '할일 A'), makeTodo(2, '할일 B', true)]));
  renderWithClient(<RecentTodos />);
  expect(await screen.findByText('할일 A')).toBeInTheDocument();
  expect(screen.getByText('할일 B')).toBeInTheDocument();
});

it('할일이 없으면 빈 상태를 렌더한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([]));
  renderWithClient(<RecentTodos />);
  expect(await screen.findByText('할일이 없습니다.')).toBeInTheDocument();
});

it('체크박스를 클릭하면 patchTodo로 done을 토글한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([makeTodo(1, '할일 A', false)]));
  mocked.patchTodo.mockResolvedValue(makeTodo(1, '할일 A', true));
  renderWithClient(<RecentTodos />);
  await screen.findByText('할일 A');
  fireEvent.click(screen.getByRole('checkbox'));
  await waitFor(() => expect(mocked.patchTodo).toHaveBeenCalledWith(1, { done: true }));
});

it('별을 클릭하면 addTodoFavorite를 호출한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([makeTodo(1, '할일 A')]));
  mocked.addTodoFavorite.mockResolvedValue({
    todo: makeTodo(1, '할일 A'),
  } as never);
  renderWithClient(<RecentTodos />);
  await screen.findByText('할일 A');
  fireEvent.click(screen.getByLabelText('즐겨찾기'));
  await waitFor(() => expect(mocked.addTodoFavorite).toHaveBeenCalledWith(1));
});

it('"모두 보기"는 항상 button이며 onSeeAll로 호출된다', async () => {
  const onSeeAll = jest.fn();
  mocked.getTodos.mockResolvedValue(listOf([makeTodo(1, '할일 A')]));
  renderWithClient(<RecentTodos onSeeAll={onSeeAll} />);
  await screen.findByText('할일 A');
  fireEvent.click(screen.getByRole('button', { name: '모두 보기' }));
  expect(onSeeAll).toHaveBeenCalledTimes(1);
});
