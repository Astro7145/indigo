jest.mock('@/src/api/todo', () => ({
  ...jest.requireActual('@/src/api/todo'),
  patchTodo: jest.fn(),
}));

jest.mock('@/src/api/favorite', () => ({
  ...jest.requireActual('@/src/api/favorite'),
  addTodoFavorite: jest.fn(),
  removeTodoFavorite: jest.fn(),
}));

import { createRef, type ComponentProps } from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import * as favoriteApi from '@/src/api/favorite';
import * as todoApi from '@/src/api/todo';
import TodoList from '@/src/components/common/todo-list/TodoList';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';
import type { Todo } from '@/src/types/todo';

const mocked = todoApi as jest.Mocked<typeof todoApi>;
const mockedFav = favoriteApi as jest.Mocked<typeof favoriteApi>;

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
  createdAt: '2026-05-20T00:00:00Z',
  updatedAt: '2026-05-20T00:00:00Z',
  goal: null,
  noteIds: [],
  tags: [],
  isFavorite: false,
  ...overrides,
});

const renderList = (overrides?: Partial<ComponentProps<typeof TodoList>>) =>
  renderWithClient(
    <TodoList todos={[makeTodo(1, '할일 A')]} size="large" onEdit={() => {}} onSelect={() => {}} {...overrides} />,
  );

beforeEach(() => jest.resetAllMocks());

it('todos를 행으로 매핑해 렌더한다', () => {
  renderList({ todos: [makeTodo(1, '할일 A'), makeTodo(2, '할일 B', { done: true })] });
  expect(screen.getByText('할일 A')).toBeInTheDocument();
  expect(screen.getByText('할일 B')).toBeInTheDocument();
  expect(screen.getAllByRole('listitem')).toHaveLength(2);
});

it('체크박스를 클릭하면 patchTodo로 done을 토글한다', async () => {
  mocked.patchTodo.mockResolvedValue(makeTodo(1, '할일 A', { done: true }));
  renderList();
  fireEvent.click(screen.getByRole('checkbox'));
  await waitFor(() => expect(mocked.patchTodo).toHaveBeenCalledWith(1, { done: true }));
});

it('즐겨찾기가 아닌 할일의 별을 클릭하면 addTodoFavorite를 호출한다', async () => {
  mockedFav.addTodoFavorite.mockResolvedValue({ todo: makeTodo(1, '할일 A') } as never);
  renderList();
  fireEvent.click(screen.getByLabelText('즐겨찾기'));
  await waitFor(() => expect(mockedFav.addTodoFavorite).toHaveBeenCalledWith(1));
});

it('즐겨찾기인 할일의 별을 클릭하면 removeTodoFavorite를 호출한다', async () => {
  mockedFav.removeTodoFavorite.mockResolvedValue(undefined as never);
  renderList({ todos: [makeTodo(1, '할일 A', { isFavorite: true })] });
  fireEvent.click(screen.getByLabelText('즐겨찾기 해제'));
  await waitFor(() => expect(mockedFav.removeTodoFavorite).toHaveBeenCalledWith(1));
});

it('케밥 메뉴에서 수정하기를 누르면 해당 할일로 onEdit을 호출한다', () => {
  const onEdit = jest.fn();
  renderList({ onEdit });
  fireEvent.click(screen.getByLabelText('더보기 메뉴'));
  fireEvent.click(screen.getByText('수정하기'));
  expect(onEdit).toHaveBeenCalledTimes(1);
  expect(onEdit.mock.calls[0][0]).toMatchObject({ id: 1, title: '할일 A' });
});

it('행을 클릭하면 해당 할일로 onSelect를 호출한다', () => {
  const onSelect = jest.fn();
  renderList({ onSelect });
  fireEvent.click(screen.getByText('할일 A'));
  expect(onSelect).toHaveBeenCalledTimes(1);
  expect(onSelect.mock.calls[0][0]).toMatchObject({ id: 1, title: '할일 A' });
});

it('children을 행 뒤에 렌더한다 — 무한 스크롤 sentinel 슬롯', () => {
  renderList({ children: <li data-testid="sentinel" /> });
  const list = screen.getByRole('list');
  expect(list.lastElementChild).toHaveAttribute('data-testid', 'sentinel');
});

it('className과 ref를 ul에 전달한다', () => {
  const ref = createRef<HTMLUListElement>();
  renderList({ ref, className: 'custom-class' });
  expect(ref.current).toBeInstanceOf(HTMLUListElement);
  expect(ref.current).toHaveClass('custom-class');
});
