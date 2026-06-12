const mockOpenCreate = jest.fn();
const mockOpenEdit = jest.fn();
const mockOpenDetail = jest.fn();
jest.mock('@/src/hooks/useTodoSheet', () => ({
  useTodoSheet: () => ({ openCreate: mockOpenCreate, openEdit: mockOpenEdit, openDetail: mockOpenDetail }),
}));
import type { ComponentProps, ReactNode } from 'react';

jest.mock('@/src/api/favorite', () => ({
  ...jest.requireActual('@/src/api/favorite'),
  getFavoriteTodos: jest.fn(),
  removeTodoFavorite: jest.fn(),
}));
jest.mock('@/src/api/goal', () => ({
  ...jest.requireActual('@/src/api/goal'),
  getAllGoals: jest.fn(),
}));

// motion: 등장 애니메이션은 시각 효과 → 테스트에선 단순 li로 통과시키고 motion 전용 prop은 DOM에 새지 않게 제거.
jest.mock('motion/react', () => {
  const MOTION_PROPS = new Set(['initial', 'animate', 'transition', 'exit', 'whileHover', 'whileInView']);
  const stripMotion = (props: Record<string, unknown>) =>
    Object.fromEntries(Object.entries(props).filter(([k]) => !MOTION_PROPS.has(k)));
  return {
    useReducedMotion: () => true,
    motion: {
      li: ({ children, ...rest }: ComponentProps<'li'> & Record<string, unknown>) => (
        <li {...(stripMotion(rest) as ComponentProps<'li'>)}>{children as ReactNode}</li>
      ),
    },
  };
});

// 수정/상세 시트는 스텁 — 케밥·행 클릭 배선만 검증한다. 삭제 확인 모달은 실제 컴포넌트를 사용한다.

import { fireEvent, screen, waitFor } from '@testing-library/react';

import * as favoriteApi from '@/src/api/favorite';
import * as goalApi from '@/src/api/goal';
import FavoritesView from '@/src/components/favorite/FavoritesView';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';
import type { FavoriteTodo, FavoriteTodoListResponse } from '@/src/types/favorite';
import type { Todo, TodoGoalRef } from '@/src/types/todo';
import type { GoalListItem, GoalListResponse } from '@/src/types/goal';

const fav = favoriteApi as jest.Mocked<typeof favoriteApi>;
const goal = goalApi as jest.Mocked<typeof goalApi>;

// favorites API는 todo로 전체 Todo를 반환한다.
const makeTodo = (id: number, overrides: Partial<Todo> = {}): Todo => ({
  id,
  teamId: 't',
  userId: 1,
  goalId: null,
  title: `todo ${id}`,
  done: false,
  fileUrl: null,
  linkUrl: null,
  dueDate: null,
  createdAt: '2026-05-20T00:00:00Z',
  updatedAt: '2026-05-20T00:00:00Z',
  goal: null,
  noteIds: [],
  tags: [],
  isFavorite: true,
  ...overrides,
});

const makeFav = (
  id: number,
  todoId: number,
  title: string,
  done = false,
  goalRef: TodoGoalRef | null = null,
  todoOverrides: Partial<Todo> = {},
): FavoriteTodo => ({
  id,
  teamId: 't',
  userId: 1,
  todoId,
  createdAt: '2026-05-20T00:00:00Z',
  todo: makeTodo(todoId, { title, done, goal: goalRef, ...todoOverrides }),
});

const favList = (favorites: FavoriteTodo[], totalCount = favorites.length): FavoriteTodoListResponse => ({
  favorites,
  nextCursor: null,
  totalCount,
});

const makeGoal = (id: number, title: string): GoalListItem => ({
  id,
  teamId: 't',
  userId: 1,
  title,
  createdAt: '2026-05-20T00:00:00Z',
  updatedAt: '2026-05-20T00:00:00Z',
  todoCount: 0,
  completedCount: 0,
});

const goalPage = (goals: GoalListItem[]): GoalListResponse => ({ goals, nextCursor: null, totalCount: goals.length });

beforeEach(() => {
  jest.resetAllMocks();
  // 기본값: 목표 목록은 비어 있음.
  goal.getAllGoals.mockResolvedValue(goalPage([]));
});

it('헤더 숫자는 현재 보이는 찜 개수를 렌더한다(전체 totalCount가 아님)', async () => {
  // 1개만 보이지만 totalCount는 42 — 클라이언트 필터 기준이라 헤더는 보이는 개수(1)를 따른다.
  fav.getFavoriteTodos.mockResolvedValue(favList([makeFav(1, 101, '찜 A')], 42));
  renderWithClient(<FavoritesView />);
  expect(await screen.findByText('찜 A')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: '찜한 할 일' })).toBeInTheDocument();
  expect(screen.getByText('1')).toBeInTheDocument();
  expect(screen.queryByText('42')).not.toBeInTheDocument();
});

it('찜한 할 일이 없으면 빈 상태 텍스트를 렌더한다', async () => {
  fav.getFavoriteTodos.mockResolvedValue(favList([], 0));
  renderWithClient(<FavoritesView />);
  expect(await screen.findByText('아직 찜한 할 일이 없어요')).toBeInTheDocument();
});

it('TO DO 탭 클릭 시 완료되지 않은 항목만 보인다(클라이언트 필터)', async () => {
  fav.getFavoriteTodos.mockResolvedValue(
    favList([makeFav(1, 101, '미완료 A', false), makeFav(2, 102, '완료 B', true)]),
  );
  renderWithClient(<FavoritesView />);
  await screen.findByText('미완료 A');
  fireEvent.click(screen.getByRole('button', { name: 'TO DO' }));
  await waitFor(() => expect(screen.queryByText('완료 B')).not.toBeInTheDocument());
  expect(screen.getByText('미완료 A')).toBeInTheDocument();
});

it('DONE 탭 클릭 시 완료된 항목만 보인다(클라이언트 필터)', async () => {
  fav.getFavoriteTodos.mockResolvedValue(
    favList([makeFav(1, 101, '미완료 A', false), makeFav(2, 102, '완료 B', true)]),
  );
  renderWithClient(<FavoritesView />);
  await screen.findByText('미완료 A');
  fireEvent.click(screen.getByRole('button', { name: 'DONE' }));
  await waitFor(() => expect(screen.queryByText('미완료 A')).not.toBeInTheDocument());
  expect(screen.getByText('완료 B')).toBeInTheDocument();
});

it('탭으로 거르면 헤더 숫자도 그 개수로 바뀐다', async () => {
  fav.getFavoriteTodos.mockResolvedValue(
    favList([makeFav(1, 101, '미완료 A', false), makeFav(2, 102, '미완료 B', false), makeFav(3, 103, '완료 C', true)]),
  );
  renderWithClient(<FavoritesView />);
  await screen.findByText('미완료 A');
  expect(screen.getByText('3')).toBeInTheDocument(); // ALL
  fireEvent.click(screen.getByRole('button', { name: 'DONE' }));
  expect(await screen.findByText('1')).toBeInTheDocument(); // DONE → 1개
});

it('목표를 선택하면 해당 목표의 항목만 보인다(클라이언트 필터)', async () => {
  fav.getFavoriteTodos.mockResolvedValue(
    favList([
      makeFav(1, 101, '목표1 할일', false, { id: 1, title: '목표1' }),
      makeFav(2, 102, '목표2 할일', false, { id: 2, title: '목표2' }),
    ]),
  );
  goal.getAllGoals.mockResolvedValue(goalPage([makeGoal(1, '목표1'), makeGoal(2, '목표2')]));
  renderWithClient(<FavoritesView />);
  await screen.findByText('목표1 할일');
  // 목표 드롭다운 열기 → "목표1" 선택
  fireEvent.click(screen.getByRole('button', { name: /전체 목표/ }));
  fireEvent.click(await screen.findByRole('menuitem', { name: '목표1' }));
  await waitFor(() => expect(screen.queryByText('목표2 할일')).not.toBeInTheDocument());
  expect(screen.getByText('목표1 할일')).toBeInTheDocument();
});

it('별 클릭 시 찜을 해제한다(removeTodoFavorite 호출)', async () => {
  fav.getFavoriteTodos.mockResolvedValue(favList([makeFav(1, 101, '찜 A')]));
  fav.removeTodoFavorite.mockResolvedValue(undefined);
  renderWithClient(<FavoritesView />);
  await screen.findByText('찜 A');
  fireEvent.click(screen.getByRole('button', { name: '즐겨찾기 해제' }));
  await waitFor(() => expect(fav.removeTodoFavorite).toHaveBeenCalledWith(101));
});

it('todo.linkUrl이 있으면 링크 아이콘을 표시한다', async () => {
  fav.getFavoriteTodos.mockResolvedValue(
    favList([makeFav(1, 101, '링크 있는 찜', false, null, { linkUrl: 'https://example.com' })]),
  );
  renderWithClient(<FavoritesView />);
  await screen.findByText('링크 있는 찜');
  expect(screen.getByRole('button', { name: '링크' })).toBeInTheDocument();
});

it('todo.linkUrl이 없으면 링크 아이콘을 표시하지 않는다', async () => {
  fav.getFavoriteTodos.mockResolvedValue(favList([makeFav(1, 101, '링크 없는 찜')]));
  renderWithClient(<FavoritesView />);
  await screen.findByText('링크 없는 찜');
  expect(screen.queryByRole('button', { name: '링크' })).not.toBeInTheDocument();
});

it('케밥 메뉴에서 수정하기를 누르면 수정 시트가 열린다', async () => {
  fav.getFavoriteTodos.mockResolvedValue(favList([makeFav(1, 101, '찜 A')]));
  renderWithClient(<FavoritesView />);
  await screen.findByText('찜 A');
  fireEvent.click(screen.getByLabelText('더보기 메뉴'));
  fireEvent.click(screen.getByText('수정하기'));
  expect(mockOpenEdit).toHaveBeenCalledTimes(1);
});

it('케밥 메뉴에서 삭제하기를 누르면 삭제 확인 모달이 열린다', async () => {
  fav.getFavoriteTodos.mockResolvedValue(favList([makeFav(1, 101, '찜 A')]));
  renderWithClient(<FavoritesView />);
  await screen.findByText('찜 A');
  fireEvent.click(screen.getByLabelText('더보기 메뉴'));
  fireEvent.click(screen.getByText('삭제하기'));
  expect(await screen.findByText('정말 삭제하시겠어요?')).toBeInTheDocument();
});

it('행을 클릭하면 상세 시트가 열린다', async () => {
  fav.getFavoriteTodos.mockResolvedValue(favList([makeFav(1, 101, '찜 A')]));
  renderWithClient(<FavoritesView />);
  fireEvent.click(await screen.findByText('찜 A'));
  expect(mockOpenDetail).toHaveBeenCalledTimes(1);
});

it('initialTab=todo면 TO DO 탭으로 시작해 미완료만 보인다 (#104)', async () => {
  goal.getAllGoals.mockResolvedValue(goalPage([]));
  fav.getFavoriteTodos.mockResolvedValue(
    favList([makeFav(1, 101, '미완료 A', false), makeFav(2, 102, '완료 B', true)]),
  );
  renderWithClient(<FavoritesView initialTab="todo" />);
  expect(await screen.findByText('미완료 A')).toBeInTheDocument();
  expect(screen.queryByText('완료 B')).not.toBeInTheDocument();
});

it('탭을 바꾸면 URL이 셸로우로 동기화된다 (#104)', async () => {
  goal.getAllGoals.mockResolvedValue(goalPage([]));
  fav.getFavoriteTodos.mockResolvedValue(favList([makeFav(1, 101, '미완료 A', false)]));
  renderWithClient(<FavoritesView />);
  await screen.findByText('미완료 A');
  fireEvent.click(screen.getByText('DONE'));
  expect(window.location.pathname + window.location.search).toBe('/favorites?tab=done');
});
