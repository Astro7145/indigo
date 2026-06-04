jest.mock('@/src/hooks/goal', () => ({ useInfiniteGoalList: jest.fn() }));
jest.mock('@/src/components/goal/GoalTodoBoard', () => ({
  __esModule: true,
  default: ({
    goal,
    onSelectTodo,
  }: {
    goal: { id: number; title: string };
    onSelectTodo: (todo: { id: number }) => void;
  }) => (
    <div data-testid="board">
      {goal.title}
      <button onClick={() => onSelectTodo({ id: goal.id })}>select-{goal.id}</button>
    </div>
  ),
}));

import type { ComponentProps } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { useInfiniteGoalList } from '@/src/hooks/goal';
import GoalTodoSection from '@/src/components/goal/GoalTodoSection';
import type { GoalListItem } from '@/src/types/goal';

const renderSection = (overrides?: Partial<ComponentProps<typeof GoalTodoSection>>) =>
  render(<GoalTodoSection onEditTodo={() => {}} onAddTodo={() => {}} onSelectTodo={() => {}} {...overrides} />);

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
  renderSection();
  expect(screen.getAllByTestId('board')).toHaveLength(2);
  expect(screen.getByText('목표1')).toBeInTheDocument();
});

it('GoalTodoBoard의 할일 선택을 onSelectTodo로 전달한다', () => {
  const onSelectTodo = jest.fn();
  renderSection({ onSelectTodo });
  fireEvent.click(screen.getByText('select-1'));
  expect(onSelectTodo).toHaveBeenCalledWith({ id: 1 });
});

it('목표가 0개면 섹션 헤더와 빈 안내를 렌더한다', () => {
  setHook({ goals: [] });
  renderSection();
  expect(screen.getByRole('region', { name: '목표 별 할일' })).toBeInTheDocument();
  expect(screen.getByText('등록한 목표가 없어요')).toBeInTheDocument();
  expect(screen.queryByTestId('board')).not.toBeInTheDocument();
});

// 무한 스크롤의 "실제 다음 페이지 로딩"은 스크롤·뷰포트가 필요해 e2e(e2e/dashboard.spec.ts)에서 검증한다.
// 여기서는 렌더 계열만 단위로 본다.

it('다음 페이지 로딩 중이면 로딩 표시를 렌더한다', () => {
  setHook({ hasNextPage: true, isFetchingNextPage: true });
  renderSection();
  expect(screen.getByText('불러오는 중…')).toBeInTheDocument();
});
