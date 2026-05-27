jest.mock('@/src/hooks/user', () => ({ useMe: jest.fn() }));
jest.mock('@/src/components/todo/RecentTodos', () => ({
  __esModule: true,
  default: ({ onSeeAll }: { onSeeAll?: () => void }) => <button onClick={onSeeAll}>recent-todos</button>,
}));
jest.mock('@/src/components/goal/ProgressCard', () => ({ __esModule: true, default: () => <div>progress-card</div> }));
jest.mock('@/src/components/goal/GoalTodoSection', () => ({
  __esModule: true,
  default: () => <div>goal-section</div>,
}));
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));

import { fireEvent, render, screen } from '@testing-library/react';

import { useMe } from '@/src/hooks/user';
import DashboardPage from '@/app/(main)/page';

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(useMe).mockReturnValue({ data: { name: '체다치즈' } } as unknown as ReturnType<typeof useMe>);
});

it('사용자 이름으로 헤더를 렌더한다', () => {
  render(<DashboardPage />);
  expect(screen.getByRole('heading', { name: '체다치즈님의 대시보드' })).toBeInTheDocument();
});

it('세 영역(최근 할일·진행 상황·목표 별 할일)을 합성한다', () => {
  render(<DashboardPage />);
  expect(screen.getByText('recent-todos')).toBeInTheDocument();
  expect(screen.getByText('progress-card')).toBeInTheDocument();
  expect(screen.getByText('goal-section')).toBeInTheDocument();
});

it('RecentTodos의 모두 보기는 할일 페이지로 이동시킨다', () => {
  render(<DashboardPage />);
  fireEvent.click(screen.getByText('recent-todos'));
  expect(mockPush).toHaveBeenCalledWith('/todos');
});
