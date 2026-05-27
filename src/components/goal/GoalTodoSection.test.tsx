jest.mock('@/src/hooks/goal', () => ({ useInfiniteGoalList: jest.fn() }));
jest.mock('@/src/components/goal/GoalTodoBoard', () => ({
  __esModule: true,
  default: ({ goal }: { goal: { id: number; title: string } }) => <div data-testid="board">{goal.title}</div>,
}));

import { render, screen } from '@testing-library/react';

import { useInfiniteGoalList } from '@/src/hooks/goal';
import GoalTodoSection from '@/src/components/goal/GoalTodoSection';
import type { GoalListItem } from '@/src/types/goal';

const makeGoal = (id: number, title: string): GoalListItem => ({
  id,
  teamId: 't',
  userId: 1,
  title,
  createdAt: '',
  updatedAt: '',
  todoCount: 2,
  completedCount: 1,
});

const mockFetchNextPage = jest.fn();

function setHook({
  goals = [makeGoal(1, '목표1'), makeGoal(2, '목표2')],
  hasNextPage = false,
  isFetchingNextPage = false,
}: { goals?: GoalListItem[]; hasNextPage?: boolean; isFetchingNextPage?: boolean } = {}) {
  jest.mocked(useInfiniteGoalList).mockReturnValue({
    data: {
      pages: [{ goals, nextCursor: hasNextPage ? 99 : null, totalCount: goals.length }],
      pageParams: [undefined],
    },
    fetchNextPage: mockFetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } as unknown as ReturnType<typeof useInfiniteGoalList>);
}

beforeEach(() => {
  jest.resetAllMocks();
  setHook();
});

it('목표마다 GoalTodoBoard를 렌더한다', () => {
  render(<GoalTodoSection />);
  expect(screen.getAllByTestId('board')).toHaveLength(2);
  expect(screen.getByText('목표1')).toBeInTheDocument();
});

it('목표가 0개면 섹션을 렌더하지 않는다', () => {
  setHook({ goals: [] });
  render(<GoalTodoSection />);
  expect(screen.queryByRole('region', { name: '목표 별 할일' })).not.toBeInTheDocument();
  expect(screen.queryByTestId('board')).not.toBeInTheDocument();
});

it('다음 페이지가 있으면 sentinel 교차 시 fetchNextPage를 호출한다', () => {
  setHook({ hasNextPage: true });
  render(<GoalTodoSection />);
  expect(mockFetchNextPage).toHaveBeenCalled();
});

it('다음 페이지가 없으면 fetchNextPage를 호출하지 않는다', () => {
  setHook({ hasNextPage: false });
  render(<GoalTodoSection />);
  expect(mockFetchNextPage).not.toHaveBeenCalled();
});

it('다음 페이지 로딩 중이면 로딩 표시를 렌더한다', () => {
  setHook({ hasNextPage: true, isFetchingNextPage: true });
  render(<GoalTodoSection />);
  expect(screen.getByText('불러오는 중…')).toBeInTheDocument();
});
