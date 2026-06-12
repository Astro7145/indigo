jest.mock('@/src/hooks/useIsMobile', () => ({ useIsMobile: () => false }));

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

import type { ComponentProps } from 'react';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';

import * as todoApi from '@/src/api/todo';
import * as favoriteApi from '@/src/api/favorite';
import GoalTodoBoard from '@/src/components/goal/GoalTodoBoard';
import { renderWithIntl } from '@/src/hooks/__tests__/test-utils';
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

const renderBoard = (overrides?: Partial<ComponentProps<typeof GoalTodoBoard>>) =>
  renderWithIntl(
    <GoalTodoBoard goal={goal} onEditTodo={() => {}} onAddTodo={() => {}} onSelectTodo={() => {}} {...overrides} />,
  );

beforeEach(() => jest.resetAllMocks());

it('목표명과 진행률(1/4 → 25%)을 렌더한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([]));
  await renderBoard();
  expect(await screen.findByText('디자인 시스템 정복하기')).toBeInTheDocument();
  expect(screen.getByText('25%')).toBeInTheDocument();
});

it('할일을 done 기준으로 To Do/Done 열에 나눠 렌더한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([makeTodo(1, '미완료 할일'), makeTodo(2, '완료 할일', true)]));
  await renderBoard();
  const todoCol = await screen.findByRole('group', { name: 'To do' });
  const doneCol = screen.getByRole('group', { name: 'Done' });
  expect(within(todoCol).getByText('미완료 할일')).toBeInTheDocument();
  expect(within(doneCol).getByText('완료 할일')).toBeInTheDocument();
});

it('노트가 없으면 노트 작성(연필) 액션을, 있으면 노트 인디케이터를 렌더한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([makeTodo(1, '노트없음'), { ...makeTodo(2, '노트있음'), noteIds: [10] }]));
  await renderBoard();
  await screen.findByText('노트없음');
  expect(screen.getByLabelText('노트 작성')).toBeInTheDocument();
  expect(screen.getByLabelText('노트')).toBeInTheDocument();
});

it('할일이 없으면 빈 UI 메시지를 렌더한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([]));
  await renderBoard();
  expect(await screen.findByText('아직 할 일이 없어요')).toBeInTheDocument();
});

// useSuspenseQuery throws on error — isError is never true; error propagates to AsyncBoundary/ErrorBoundary
it.todo('조회 실패 시 에러 메시지를 렌더한다');

it('검색어가 있고 결과가 없으면 "검색 결과가 없어요"를 렌더한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([]));
  await renderBoard();
  await screen.findByText('아직 할 일이 없어요');
  const input = screen.getByLabelText('할 일 검색');
  fireEvent.change(input, { target: { value: '없는키워드' } });
  fireEvent.keyUp(input, { key: 'Enter' });
  expect(await screen.findByText('검색 결과가 없어요')).toBeInTheDocument();
  expect(screen.queryByText('아직 할 일이 없어요')).not.toBeInTheDocument();
});

it('체크박스 클릭 시 patchTodo로 done을 토글한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([makeTodo(1, '미완료 할일', false)]));
  mocked.patchTodo.mockResolvedValue(makeTodo(1, '미완료 할일', true));
  await renderBoard();
  await screen.findByText('미완료 할일');
  fireEvent.click(screen.getByRole('checkbox', { name: '미완료 할일' }));
  await waitFor(() => expect(mocked.patchTodo).toHaveBeenCalledWith(1, { done: true }));
});

it('별 클릭 시 addTodoFavorite를 호출한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([makeTodo(1, '할일 A')]));
  (favoriteApi.addTodoFavorite as jest.Mock).mockResolvedValue({ todo: makeTodo(1, '할일 A') });
  await renderBoard();
  await screen.findByText('할일 A');
  fireEvent.click(screen.getByLabelText('즐겨찾기'));
  await waitFor(() => expect(favoriteApi.addTodoFavorite).toHaveBeenCalledWith(1));
});

it('검색어 입력 후 Enter 시 keyword로 getTodos를 호출한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([]));
  await renderBoard();
  await screen.findByText('디자인 시스템 정복하기');
  const input = screen.getByLabelText('할 일 검색');
  fireEvent.change(input, { target: { value: '실습' } });
  fireEvent.keyUp(input, { key: 'Enter' });
  await waitFor(() =>
    expect(mocked.getTodos).toHaveBeenCalledWith(expect.objectContaining({ goalId: 9, keyword: '실습' })),
  );
});

it('카드 클릭 시 목표 상세로 이동한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([]));
  await renderBoard();
  fireEvent.click(await screen.findByText('디자인 시스템 정복하기'));
  expect(mockPush).toHaveBeenCalledWith('/goals/9');
});

it('"할일 추가" 버튼 클릭은 카드 네비게이션을 트리거하지 않는다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([]));
  await renderBoard();
  await screen.findByText('디자인 시스템 정복하기');
  // 모바일 +아이콘 버튼과 태블릿+ 텍스트 버튼 둘 다 카드 이동을 막아야 한다
  screen.getAllByRole('button', { name: '할 일 추가' }).forEach((btn) => fireEvent.click(btn));
  expect(mockPush).not.toHaveBeenCalled();
});

it('진행바는 최종 percent를 aria-valuenow로 노출하고 fill 요소를 가진다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([]));
  await renderBoard();
  const bar = await screen.findByRole('progressbar', { name: '디자인 시스템 정복하기 진행률' });
  expect(bar).toHaveAttribute('aria-valuenow', '25');
  expect(bar.firstElementChild).toBeTruthy();
});

it('할일 행을 클릭하면 해당 할일로 onSelectTodo를 호출한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([makeTodo(1, '미완료 할일')]));
  const onSelectTodo = jest.fn();
  await renderBoard({ onSelectTodo });
  fireEvent.click(await screen.findByText('미완료 할일'));
  expect(onSelectTodo).toHaveBeenCalledTimes(1);
  expect(onSelectTodo.mock.calls[0][0]).toMatchObject({ id: 1, title: '미완료 할일' });
  expect(mockPush).not.toHaveBeenCalled();
});

it('케밥 메뉴에서 삭제하기를 누르면 삭제 확인 모달이 열린다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([makeTodo(1, '미완료 할일')]));
  await renderBoard();
  await screen.findByText('미완료 할일');
  fireEvent.click(screen.getByLabelText('더보기 메뉴'));
  fireEvent.click(screen.getByText('삭제하기'));
  expect(await screen.findByText('정말 삭제하시겠어요?')).toBeInTheDocument();
});

it('이미 즐겨찾기된 별 클릭 시 removeTodoFavorite를 호출한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([{ ...makeTodo(1, '할일 A'), isFavorite: true }]));
  (favoriteApi.removeTodoFavorite as jest.Mock).mockResolvedValue(undefined);
  await renderBoard();
  await screen.findByText('할일 A');
  fireEvent.click(screen.getByLabelText('즐겨찾기 해제'));
  await waitFor(() => expect(favoriteApi.removeTodoFavorite).toHaveBeenCalledWith(1));
});
