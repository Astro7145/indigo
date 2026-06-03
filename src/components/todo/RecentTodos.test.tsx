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

import type { ComponentProps } from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import * as favoriteApi from '@/src/api/favorite';
import * as todoApi from '@/src/api/todo';
import RecentTodos from '@/src/components/todo/RecentTodos';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';
import type { Todo } from '@/src/types/todo';

const renderRecent = (overrides?: Partial<ComponentProps<typeof RecentTodos>>) =>
  renderWithClient(<RecentTodos onEditTodo={() => {}} onSelectTodo={() => {}} {...overrides} />);

const mocked = todoApi as jest.Mocked<typeof todoApi>;
const mockedFav = favoriteApi as jest.Mocked<typeof favoriteApi>;

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

it('useTodoList 결과의 할일 제목을 렌더한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([makeTodo(1, '할일 A'), makeTodo(2, '할일 B', true)]));
  renderRecent();
  expect(await screen.findByText('할일 A')).toBeInTheDocument();
  expect(screen.getByText('할일 B')).toBeInTheDocument();
});

it('할일이 없으면 빈 상태를 렌더한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([]));
  renderRecent();
  expect(await screen.findByText('최근에 등록한 할 일이 없어요')).toBeInTheDocument();
});

it('체크박스를 클릭하면 patchTodo로 done을 토글한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([makeTodo(1, '할일 A', false)]));
  mocked.patchTodo.mockResolvedValue(makeTodo(1, '할일 A', true));
  renderRecent();
  await screen.findByText('할일 A');
  fireEvent.click(screen.getByRole('checkbox'));
  await waitFor(() => expect(mocked.patchTodo).toHaveBeenCalledWith(1, { done: true }));
});

it('별을 클릭하면 addTodoFavorite를 호출한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([makeTodo(1, '할일 A')]));
  mockedFav.addTodoFavorite.mockResolvedValue({
    todo: makeTodo(1, '할일 A'),
  } as never);
  renderRecent();
  await screen.findByText('할일 A');
  fireEvent.click(screen.getByLabelText('즐겨찾기'));
  await waitFor(() => expect(mockedFav.addTodoFavorite).toHaveBeenCalledWith(1));
});

it('"모두 보기"는 /todos로 가는 링크다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([makeTodo(1, '할일 A')]));
  renderRecent();
  await screen.findByText('할일 A');
  expect(screen.getByRole('link', { name: '모두 보기' })).toHaveAttribute('href', '/todos');
});

it('useTodoList를 limit: 4로 호출해 최신 4개를 요청한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([makeTodo(1, '할일 A')]));
  renderRecent();
  await screen.findByText('할일 A');
  expect(mocked.getTodos).toHaveBeenCalledWith(expect.objectContaining({ sort: 'latest', limit: 4 }));
});

it('할일 행을 클릭하면 해당 할일로 onSelectTodo를 호출한다', async () => {
  mocked.getTodos.mockResolvedValue({
    todos: [makeTodo(1, '자바스크립트 듣기')],
    nextCursor: null,
    totalCount: 1,
  } as never);
  const onSelectTodo = jest.fn();
  renderRecent({ onSelectTodo });
  const title = await screen.findByText('자바스크립트 듣기');
  fireEvent.click(title);
  expect(onSelectTodo).toHaveBeenCalledTimes(1);
  expect(onSelectTodo.mock.calls[0][0]).toMatchObject({ id: 1, title: '자바스크립트 듣기' });
});
