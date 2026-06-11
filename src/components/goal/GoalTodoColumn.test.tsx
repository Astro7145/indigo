jest.mock('@/src/api/todo', () => ({
  ...jest.requireActual('@/src/api/todo'),
  getTodos: jest.fn(),
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));

import type { ComponentProps } from 'react';
import { fireEvent, screen } from '@testing-library/react';

import * as todoApi from '@/src/api/todo';
import GoalTodoColumn from '@/src/components/goal/GoalTodoColumn';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';
import type { Todo } from '@/src/types/todo';

const mocked = todoApi as jest.Mocked<typeof todoApi>;

const makeTodo = (id: number, title: string, done = false): Todo =>
  ({ id, title, done, goalId: 3, noteIds: [], linkUrl: null, fileUrl: null, isFavorite: false }) as never;
const listOf = (todos: Todo[]) => ({ todos, nextCursor: null, totalCount: todos.length });

const renderColumn = (overrides?: Partial<ComponentProps<typeof GoalTodoColumn>>) =>
  renderWithClient(
    <GoalTodoColumn
      goalId={3}
      done={false}
      onEditTodo={() => {}}
      onAddTodo={() => {}}
      onSelectTodo={() => {}}
      {...overrides}
    />,
  );

beforeEach(() => jest.resetAllMocks());

it('To do 컬럼은 받아온 할 일을 렌더한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([makeTodo(1, '할 일 하나')]));
  renderColumn();
  expect(await screen.findByText('할 일 하나')).toBeInTheDocument();
  expect(screen.getByText('TO DO')).toBeInTheDocument();
});

it('To do 컬럼은 goalId·done=false 필터로 조회한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([]));
  renderColumn();
  await screen.findByText('해야할 일이 아직 없어요');
  expect(mocked.getTodos).toHaveBeenCalledWith(expect.objectContaining({ goalId: 3, done: 'false' }));
});

it('캘린더 보기를 누르면 목표 필터가 프리셋된 캘린더로 이동한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([]));
  renderColumn();
  fireEvent.click(await screen.findByRole('button', { name: '캘린더 보기' }));
  expect(mockPush).toHaveBeenCalledWith('/calendar?goalId=3');
});

it('빈 Done 컬럼은 완료 안내 문구를 보여준다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([]));
  renderColumn({ done: true });
  expect(await screen.findByText('완료한 일이 아직 없어요')).toBeInTheDocument();
});

it('할 일을 클릭하면 그 할 일의 상세 보기로 이어진다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([makeTodo(1, '미완료 할일')]));
  const onSelectTodo = jest.fn();
  renderColumn({ onSelectTodo });
  fireEvent.click(await screen.findByText('미완료 할일'));
  expect(onSelectTodo).toHaveBeenCalledTimes(1);
  expect(onSelectTodo.mock.calls[0][0]).toMatchObject({ id: 1, title: '미완료 할일' });
});

it('케밥 메뉴에서 수정하기를 누르면 그 할 일의 수정으로 이어진다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([makeTodo(1, '미완료 할일')]));
  const onEditTodo = jest.fn();
  renderColumn({ onEditTodo });
  await screen.findByText('미완료 할일');
  fireEvent.click(screen.getByLabelText('더보기 메뉴'));
  fireEvent.click(screen.getByText('수정하기'));
  expect(onEditTodo).toHaveBeenCalledTimes(1);
  expect(onEditTodo.mock.calls[0][0]).toMatchObject({ id: 1, title: '미완료 할일' });
});

it('케밥 메뉴에서 삭제하기를 누르면 삭제 확인 모달이 열린다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([makeTodo(1, '미완료 할일')]));
  renderColumn();
  await screen.findByText('미완료 할일');
  fireEvent.click(screen.getByLabelText('더보기 메뉴'));
  fireEvent.click(screen.getByText('삭제하기'));
  expect(await screen.findByText('정말 삭제하시겠어요?')).toBeInTheDocument();
});

it('To do 컬럼에서 "할 일 추가"를 누르면 이 목표에 할 일 추가가 시작된다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([]));
  const onAddTodo = jest.fn();
  renderColumn({ onAddTodo });
  await screen.findByText('해야할 일이 아직 없어요');
  fireEvent.click(screen.getByRole('button', { name: '할 일 추가' }));
  expect(onAddTodo).toHaveBeenCalledWith(3);
});

it('Done 컬럼에는 "할 일 추가" 버튼이 없다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([]));
  renderColumn({ done: true });
  await screen.findByText('완료한 일이 아직 없어요');
  expect(screen.queryByRole('button', { name: '할 일 추가' })).not.toBeInTheDocument();
});
