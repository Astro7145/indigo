import type { ComponentProps, ReactNode } from 'react';

jest.mock('@/src/api/favorite', () => ({
  ...jest.requireActual('@/src/api/favorite'),
  getFavoriteTodos: jest.fn(),
  removeTodoFavorite: jest.fn(),
}));
jest.mock('@/src/api/goal', () => ({
  ...jest.requireActual('@/src/api/goal'),
  getGoals: jest.fn(),
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

import { fireEvent, screen, waitFor } from '@testing-library/react';

import * as favoriteApi from '@/src/api/favorite';
import * as goalApi from '@/src/api/goal';
import FavoritesPage from '@/app/(main)/favorites/page';
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
  goal.getGoals.mockResolvedValue(goalPage([]));
});

it('헤더에 "찜한 할 일" 제목과 totalCount를 렌더한다', async () => {
  fav.getFavoriteTodos.mockResolvedValue(favList([makeFav(1, 101, '찜 A')], 42));
  renderWithClient(<FavoritesPage />);
  expect(await screen.findByText('찜 A')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: '찜한 할 일' })).toBeInTheDocument();
  expect(screen.getByText('42')).toBeInTheDocument();
});

it('찜한 할 일이 없으면 빈 상태 텍스트를 렌더한다', async () => {
  fav.getFavoriteTodos.mockResolvedValue(favList([], 0));
  renderWithClient(<FavoritesPage />);
  expect(await screen.findByText('아직 찜한 할 일이 없어요')).toBeInTheDocument();
});

it('TO DO 탭 클릭 시 완료되지 않은 항목만 보인다(클라이언트 필터)', async () => {
  fav.getFavoriteTodos.mockResolvedValue(
    favList([makeFav(1, 101, '미완료 A', false), makeFav(2, 102, '완료 B', true)]),
  );
  renderWithClient(<FavoritesPage />);
  await screen.findByText('미완료 A');
  fireEvent.click(screen.getByRole('button', { name: 'TO DO' }));
  await waitFor(() => expect(screen.queryByText('완료 B')).not.toBeInTheDocument());
  expect(screen.getByText('미완료 A')).toBeInTheDocument();
});

it('DONE 탭 클릭 시 완료된 항목만 보인다(클라이언트 필터)', async () => {
  fav.getFavoriteTodos.mockResolvedValue(
    favList([makeFav(1, 101, '미완료 A', false), makeFav(2, 102, '완료 B', true)]),
  );
  renderWithClient(<FavoritesPage />);
  await screen.findByText('미완료 A');
  fireEvent.click(screen.getByRole('button', { name: 'DONE' }));
  await waitFor(() => expect(screen.queryByText('미완료 A')).not.toBeInTheDocument());
  expect(screen.getByText('완료 B')).toBeInTheDocument();
});

it('목표를 선택하면 해당 목표의 항목만 보인다(클라이언트 필터)', async () => {
  fav.getFavoriteTodos.mockResolvedValue(
    favList([
      makeFav(1, 101, '목표1 할일', false, { id: 1, title: '목표1' }),
      makeFav(2, 102, '목표2 할일', false, { id: 2, title: '목표2' }),
    ]),
  );
  goal.getGoals.mockResolvedValue(goalPage([makeGoal(1, '목표1'), makeGoal(2, '목표2')]));
  renderWithClient(<FavoritesPage />);
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
  renderWithClient(<FavoritesPage />);
  await screen.findByText('찜 A');
  fireEvent.click(screen.getByRole('button', { name: '즐겨찾기 해제' }));
  await waitFor(() => expect(fav.removeTodoFavorite).toHaveBeenCalledWith(101));
});

it('todo.linkUrl이 있으면 링크 아이콘을 표시한다', async () => {
  fav.getFavoriteTodos.mockResolvedValue(
    favList([makeFav(1, 101, '링크 있는 찜', false, null, { linkUrl: 'https://example.com' })]),
  );
  renderWithClient(<FavoritesPage />);
  await screen.findByText('링크 있는 찜');
  expect(screen.getByRole('button', { name: '링크' })).toBeInTheDocument();
});

it('todo.linkUrl이 없으면 링크 아이콘을 표시하지 않는다', async () => {
  fav.getFavoriteTodos.mockResolvedValue(favList([makeFav(1, 101, '링크 없는 찜')]));
  renderWithClient(<FavoritesPage />);
  await screen.findByText('링크 없는 찜');
  expect(screen.queryByRole('button', { name: '링크' })).not.toBeInTheDocument();
});
