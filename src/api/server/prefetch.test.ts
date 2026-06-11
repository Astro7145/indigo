jest.mock('@/src/api/server/server-get', () => ({ serverGet: jest.fn() }));

import { QueryClient } from '@tanstack/react-query';
import { CalendarDate } from '@internationalized/date';

import { favoriteKeys } from '@/src/api/favorite';
import { goalKeys } from '@/src/api/goal';
import { noteKeys } from '@/src/api/note';
import {
  prefetchAllGoals,
  prefetchCalendarMonth,
  prefetchDashboard,
  prefetchFavorites,
  prefetchGoalDetail,
  prefetchInfiniteNotes,
  prefetchInfiniteTodos,
  prefetchMe,
  prefetchRecentTodos,
} from '@/src/api/server/prefetch';
import { serverGet } from '@/src/api/server/server-get';
import { todoKeys } from '@/src/api/todo';
import { userKeys } from '@/src/api/user';

const mocked = serverGet as jest.Mock;
let qc: QueryClient;

beforeEach(() => {
  jest.resetAllMocks();
  qc = new QueryClient();
});

it('prefetchMe는 userKeys.me() 키에 프로필을 캐시한다', async () => {
  mocked.mockResolvedValue({ id: 1, name: '체다치즈' });
  await prefetchMe(qc);
  expect(mocked).toHaveBeenCalledWith('users/me');
  expect(qc.getQueryData(userKeys.me())).toMatchObject({ name: '체다치즈' });
});

it('prefetchRecentTodos는 useTodoList({sort,limit:4})와 동일 키에 캐시한다', async () => {
  mocked.mockResolvedValue({ todos: [], nextCursor: null, totalCount: 0 });
  await prefetchRecentTodos(qc);
  expect(qc.getQueryData(todoKeys.list({ sort: 'latest', limit: 4 }))).toBeDefined();
});

it('prefetchInfiniteTodos는 무한쿼리 첫 페이지 shape으로 캐시한다', async () => {
  mocked.mockResolvedValue({ todos: [{ id: 1 }], nextCursor: null, totalCount: 1 });
  await prefetchInfiniteTodos(qc, { sort: 'latest', limit: 40 });
  const data = qc.getQueryData<{ pages: unknown[]; pageParams: unknown[] }>([
    ...todoKeys.list({ sort: 'latest', limit: 40 }),
    'infinite',
  ]);
  expect(data?.pages).toHaveLength(1);
  expect(data?.pageParams).toEqual([undefined]);
});

it('prefetchAllGoals는 커서를 끝까지 합쳐 goalList "all" 키에 캐시한다', async () => {
  mocked
    .mockResolvedValueOnce({ goals: [{ id: 1 }], nextCursor: 2, totalCount: 2 })
    .mockResolvedValueOnce({ goals: [{ id: 2 }], nextCursor: null, totalCount: 2 });
  await prefetchAllGoals(qc);
  const data = qc.getQueryData<{ goals: { id: number }[] }>([...goalKeys.lists(), 'all']);
  expect(data?.goals.map((g) => g.id)).toEqual([1, 2]);
});

it('prefetchFavorites는 favoriteKeys.list({limit:100}) 키에 캐시한다', async () => {
  mocked.mockResolvedValue({ favorites: [], nextCursor: null, totalCount: 0 });
  await prefetchFavorites(qc);
  expect(mocked).toHaveBeenCalledWith('todos/favorites', { limit: 100 });
  expect(qc.getQueryData(favoriteKeys.list({ limit: 100 }))).toBeDefined();
});

it('prefetchGoalDetail은 goalKeys.detail 키에 캐시한다', async () => {
  mocked.mockResolvedValue({ id: 7, title: '목표' });
  await prefetchGoalDetail(qc, 7);
  expect(mocked).toHaveBeenCalledWith('goals/7');
  expect(qc.getQueryData(goalKeys.detail(7))).toMatchObject({ id: 7 });
});

it('prefetchInfiniteNotes는 노트 모아보기 초기 키({goalId, sort:latest})에 캐시한다', async () => {
  mocked.mockResolvedValue({ notes: [], nextCursor: null, totalCount: 0 });
  await prefetchInfiniteNotes(qc, 3);
  expect(qc.getQueryData([...noteKeys.list({ goalId: 3, sort: 'latest' }), 'infinite'])).toBeDefined();
});

it('prefetchCalendarMonth는 useTodosInRange와 동일한 range 키에 커서 합산으로 캐시한다', async () => {
  mocked
    .mockResolvedValueOnce({ todos: [{ id: 1 }], nextCursor: 9, totalCount: 2 })
    .mockResolvedValueOnce({ todos: [{ id: 2 }], nextCursor: null, totalCount: 2 });
  await prefetchCalendarMonth(qc, new CalendarDate(2025, 1, 10));
  // calendarGridRange(2025-01) = 2024-12-30 ~ 2025-02-02 (월요일 시작 그리드)
  const data = qc.getQueryData<{ todos: { id: number }[] }>([
    ...todoKeys.lists(),
    'range',
    { from: '2024-12-30', to: '2025-02-02' },
  ]);
  expect(data?.todos.map((t) => t.id)).toEqual([1, 2]);
});

it('prefetchDashboard는 첫 페이지 목표들의 보드까지 함께 캐시한다', async () => {
  mocked.mockImplementation((path: string, params?: Record<string, unknown>) => {
    if (path === 'goals' && params?.limit === 2)
      return Promise.resolve({ goals: [{ id: 11 }, { id: 12 }], nextCursor: null, totalCount: 2 });
    if (path === 'goals') return Promise.resolve({ goals: [], nextCursor: null, totalCount: 0 });
    return Promise.resolve({ todos: [], nextCursor: null, totalCount: 0 });
  });
  await prefetchDashboard(qc);
  expect(qc.getQueryData(todoKeys.list({ goalId: 11 }))).toBeDefined();
  expect(qc.getQueryData(todoKeys.list({ goalId: 12 }))).toBeDefined();
});
