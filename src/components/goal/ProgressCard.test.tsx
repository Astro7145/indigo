jest.mock('@/src/api/goal', () => ({
  ...jest.requireActual('@/src/api/goal'),
  getGoals: jest.fn(),
  getGoal: jest.fn(),
}));
jest.mock('@/src/api/user', () => ({
  ...jest.requireActual('@/src/api/user'),
  getMe: jest.fn(),
}));

import { screen, waitFor } from '@testing-library/react';

import * as goalApi from '@/src/api/goal';
import * as userApi from '@/src/api/user';
import ProgressCard from '@/src/components/goal/ProgressCard';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';
import type { GoalDetail, GoalListResponse } from '@/src/types/goal';
import type { UserProfile } from '@/src/types/user';

const goalMock = goalApi as jest.Mocked<typeof goalApi>;
const userMock = userApi as jest.Mocked<typeof userApi>;

const me: UserProfile = {
  id: 1,
  teamId: 't',
  email: 'a@b.c',
  name: '체다치즈',
  image: null,
  createdAt: '2026-05-20T00:00:00Z',
  updatedAt: '2026-05-20T00:00:00Z',
};

beforeEach(() => jest.resetAllMocks());

it('goalId 없으면 전체 goal 집계로 진행도를 계산한다 (3/4 → 75)', async () => {
  const list: GoalListResponse = {
    goals: [
      {
        id: 1,
        teamId: 't',
        userId: 1,
        title: 'g1',
        createdAt: '',
        updatedAt: '',
        todoCount: 2,
        completedCount: 2,
      },
      {
        id: 2,
        teamId: 't',
        userId: 1,
        title: 'g2',
        createdAt: '',
        updatedAt: '',
        todoCount: 2,
        completedCount: 1,
      },
    ],
    nextCursor: null,
    totalCount: 2,
  };
  goalMock.getGoals.mockResolvedValue(list);
  userMock.getMe.mockResolvedValue(me);
  renderWithClient(<ProgressCard />);
  const bar = (await screen.findAllByRole('progressbar'))[0];
  await waitFor(() => expect(bar).toHaveAttribute('aria-valuenow', '75'));
});

it('goalId 있으면 해당 goal todos로 진행도를 계산한다 (1/2 → 50)', async () => {
  const detail: GoalDetail = {
    id: 9,
    teamId: 't',
    userId: 1,
    title: '목표',
    createdAt: '',
    updatedAt: '',
    todos: [
      { id: 1, title: 'a', done: true, createdAt: '', updatedAt: '' },
      { id: 2, title: 'b', done: false, createdAt: '', updatedAt: '' },
    ],
  };
  goalMock.getGoal.mockResolvedValue(detail);
  renderWithClient(<ProgressCard goalId={9} />);
  const bar = (await screen.findAllByRole('progressbar'))[0];
  await waitFor(() => expect(bar).toHaveAttribute('aria-valuenow', '50'));
  expect(goalMock.getGoal).toHaveBeenCalledWith(9);
});

it('전체 변형은 이름을 넣어 본문을 만든다', async () => {
  goalMock.getGoals.mockResolvedValue({
    goals: [],
    nextCursor: null,
    totalCount: 0,
  });
  userMock.getMe.mockResolvedValue(me);
  renderWithClient(<ProgressCard />);
  // 본문은 "{name}님의" / "진행도는"으로 분리 렌더 — 두 부분이 모두 나타나는지 검증
  expect(await screen.findAllByText('체다치즈님의')).not.toHaveLength(0);
  expect(screen.getAllByText('진행도는')).not.toHaveLength(0);
});
