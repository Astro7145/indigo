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

import { fireEvent, screen, waitFor, within } from '@testing-library/react';

import * as todoApi from '@/src/api/todo';
import * as favoriteApi from '@/src/api/favorite';
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

it('조회 실패 시 에러 메시지를 렌더한다', async () => {
  mocked.getTodos.mockRejectedValue(new Error('fail'));
  renderWithClient(<GoalTodoBoard goal={goal} />);
  expect(await screen.findByText('불러오지 못했어요')).toBeInTheDocument();
});

it('검색어가 있고 결과가 없으면 "검색 결과가 없어요"를 렌더한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([]));
  renderWithClient(<GoalTodoBoard goal={goal} />);
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
  renderWithClient(<GoalTodoBoard goal={goal} />);
  await screen.findByText('미완료 할일');
  fireEvent.click(screen.getByRole('checkbox', { name: '미완료 할일' }));
  await waitFor(() => expect(mocked.patchTodo).toHaveBeenCalledWith(1, { done: true }));
});

it('별 클릭 시 addTodoFavorite를 호출한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([makeTodo(1, '할일 A')]));
  (favoriteApi.addTodoFavorite as jest.Mock).mockResolvedValue({ todo: makeTodo(1, '할일 A') });
  renderWithClient(<GoalTodoBoard goal={goal} />);
  await screen.findByText('할일 A');
  fireEvent.click(screen.getByLabelText('즐겨찾기'));
  await waitFor(() => expect(favoriteApi.addTodoFavorite).toHaveBeenCalledWith(1));
});

it('검색어 입력 후 Enter 시 keyword로 getTodos를 호출한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([]));
  renderWithClient(<GoalTodoBoard goal={goal} />);
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
  renderWithClient(<GoalTodoBoard goal={goal} />);
  fireEvent.click(await screen.findByText('디자인 시스템 정복하기'));
  expect(mockPush).toHaveBeenCalledWith('/goals/9');
});

it('"할일 추가" 버튼 클릭은 카드 네비게이션을 트리거하지 않는다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([]));
  renderWithClient(<GoalTodoBoard goal={goal} />);
  await screen.findByText('디자인 시스템 정복하기');
  // 모바일 +아이콘 버튼과 태블릿+ 텍스트 버튼 둘 다 카드 이동을 막아야 한다
  screen.getAllByRole('button', { name: '할 일 추가' }).forEach((btn) => fireEvent.click(btn));
  expect(mockPush).not.toHaveBeenCalled();
});

it('진행바는 최종 percent를 aria-valuenow로 노출하고 fill 요소를 가진다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([]));
  renderWithClient(<GoalTodoBoard goal={goal} />);
  const bar = await screen.findByRole('progressbar', { name: '디자인 시스템 정복하기 진행률' });
  expect(bar).toHaveAttribute('aria-valuenow', '25');
  expect(bar.firstElementChild).toBeTruthy();
});

it('이미 즐겨찾기된 별 클릭 시 removeTodoFavorite를 호출한다', async () => {
  mocked.getTodos.mockResolvedValue(listOf([{ ...makeTodo(1, '할일 A'), isFavorite: true }]));
  (favoriteApi.removeTodoFavorite as jest.Mock).mockResolvedValue(undefined);
  renderWithClient(<GoalTodoBoard goal={goal} />);
  await screen.findByText('할일 A');
  fireEvent.click(screen.getByLabelText('즐겨찾기 해제'));
  await waitFor(() => expect(favoriteApi.removeTodoFavorite).toHaveBeenCalledWith(1));
});
