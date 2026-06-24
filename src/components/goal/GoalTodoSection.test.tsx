jest.mock('@/src/hooks/goal', () => ({ useAllGoalsSuspense: jest.fn() }));
jest.mock('@/src/components/goal/GoalTodoBoard', () => ({
  __esModule: true,
  default: ({ goal }: { goal: { id: number; title: string } }) => <div data-testid="board">{goal.title}</div>,
}));

import type { ComponentProps } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { useAllGoalsSuspense } from '@/src/hooks/goal';
import GoalTodoSection from '@/src/components/goal/GoalTodoSection';
import type { GoalListItem } from '@/src/types/goal';

// 윈도잉 센티넬이 IntersectionObserver를 생성하므로 jsdom용 no-op stub을 둔다
// (실제 교차 기반 추가 로딩은 e2e에서 검증).
class IOStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
beforeAll(() => {
  (global as unknown as { IntersectionObserver: typeof IOStub }).IntersectionObserver = IOStub;
});

const renderSection = (overrides?: Partial<ComponentProps<typeof GoalTodoSection>>) =>
  render(<GoalTodoSection {...overrides} />);

const makeGoal = (
  id: number,
  title: string,
  createdAt = '2026-01-01T00:00:00Z',
  todoCount = 2,
  completedCount = 1,
): GoalListItem => ({
  id,
  teamId: 't',
  userId: 1,
  title,
  createdAt,
  updatedAt: createdAt,
  todoCount,
  completedCount,
});

function setGoals(goals: GoalListItem[]) {
  jest.mocked(useAllGoalsSuspense).mockReturnValue({
    data: { goals, nextCursor: null, totalCount: goals.length },
  } as unknown as ReturnType<typeof useAllGoalsSuspense>);
}

const boardTitles = () => screen.getAllByTestId('board').map((b) => b.textContent);

beforeEach(() => {
  jest.resetAllMocks();
  setGoals([makeGoal(1, '목표1'), makeGoal(2, '목표2')]);
});

it('목표마다 GoalTodoBoard를 렌더한다', () => {
  renderSection();
  expect(screen.getAllByTestId('board')).toHaveLength(2);
});

it('목표가 0개면 섹션 헤더와 빈 안내를 렌더한다', () => {
  setGoals([]);
  renderSection();
  expect(screen.getByRole('region', { name: '목표별 할일' })).toBeInTheDocument();
  expect(screen.getByText('등록한 목표가 없어요')).toBeInTheDocument();
  expect(screen.queryByTestId('board')).not.toBeInTheDocument();
});

it('기본은 최신순(생성일 내림차순)으로 렌더한다', () => {
  setGoals([makeGoal(1, '오래된', '2026-01-01T00:00:00Z'), makeGoal(2, '최신', '2026-05-01T00:00:00Z')]);
  renderSection();
  expect(boardTitles()).toEqual(['최신', '오래된']);
});

it('정렬을 오래된순으로 바꾸면 순서가 반대가 된다', () => {
  setGoals([makeGoal(1, '오래된', '2026-01-01T00:00:00Z'), makeGoal(2, '최신', '2026-05-01T00:00:00Z')]);
  renderSection();
  fireEvent.click(screen.getByRole('button', { name: '정렬' }));
  fireEvent.click(screen.getByRole('menuitem', { name: '오래된순' }));
  expect(boardTitles()).toEqual(['오래된', '최신']);
});

it('정렬을 진행률 높은순으로 바꾸면 진행률 높은 목표가 먼저다', () => {
  setGoals([
    makeGoal(1, '저진행', '2026-05-01T00:00:00Z', 4, 1), // 25%
    makeGoal(2, '고진행', '2026-01-01T00:00:00Z', 4, 4), // 100%
  ]);
  renderSection();
  // 기본 최신순이면 [저진행, 고진행]
  expect(boardTitles()).toEqual(['저진행', '고진행']);
  fireEvent.click(screen.getByRole('button', { name: '정렬' }));
  fireEvent.click(screen.getByRole('menuitem', { name: '진행률 높은순' }));
  expect(boardTitles()).toEqual(['고진행', '저진행']);
});

it('목표가 초기 윈도우(2)보다 많으면 처음엔 2개만 렌더한다', () => {
  setGoals([makeGoal(1, '목표1'), makeGoal(2, '목표2'), makeGoal(3, '목표3')]);
  renderSection();
  expect(screen.getAllByTestId('board')).toHaveLength(2);
});
