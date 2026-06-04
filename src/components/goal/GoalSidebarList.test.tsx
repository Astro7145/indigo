class IO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-expect-error test shim
global.IntersectionObserver = IO;

const push = jest.fn();
const showToast = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/goals/5/notes',
}));
jest.mock('@/src/hooks/useToast', () => ({ useToast: () => ({ showToast, hideToast: jest.fn() }) }));
jest.mock('@/src/api/goal', () => ({
  ...jest.requireActual('@/src/api/goal'),
  getGoals: jest.fn(),
  createGoal: jest.fn(),
}));

import { fireEvent, screen, waitFor } from '@testing-library/react';

import * as goalApi from '@/src/api/goal';
import GoalSidebarList from '@/src/components/goal/GoalSidebarList';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';
import type { GoalListItem, GoalListResponse } from '@/src/types/goal';

const goalMock = goalApi as jest.Mocked<typeof goalApi>;

const item = (id: number, title: string): GoalListItem => ({
  id,
  teamId: 't',
  userId: 1,
  title,
  createdAt: '2024-04-29T00:00:00Z',
  updatedAt: '2024-04-29T00:00:00Z',
  todoCount: 0,
  completedCount: 0,
});
const page = (goals: GoalListItem[]): GoalListResponse => ({ goals, nextCursor: null, totalCount: goals.length });

const openList = () => fireEvent.click(screen.getByRole('button', { name: '목표' }));

beforeEach(() => {
  jest.clearAllMocks();
});

it('목표 목록을 렌더한다', async () => {
  goalMock.getGoals.mockResolvedValue(page([item(5, '목표 A'), item(6, '목표 B')]));
  renderWithClient(<GoalSidebarList />);
  openList();
  expect(await screen.findByText('목표 A')).toBeInTheDocument();
  expect(screen.getByText('목표 B')).toBeInTheDocument();
});

it('목표 추가 시 createGoal을 title로 호출한다', async () => {
  goalMock.getGoals.mockResolvedValue(page([]));
  goalMock.createGoal.mockResolvedValue(item(9, '새 목표') as never);
  renderWithClient(<GoalSidebarList />);
  fireEvent.click(screen.getByRole('button', { name: '목표 추가' }));
  const input = screen.getByLabelText('새 목표 입력');
  fireEvent.change(input, { target: { value: '새 목표' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  await waitFor(() => expect(goalMock.createGoal).toHaveBeenCalledWith({ title: '새 목표' }));
});

it('목표 생성 실패 시 Toast를 띄운다', async () => {
  goalMock.getGoals.mockResolvedValue(page([]));
  goalMock.createGoal.mockRejectedValue(new Error('fail'));
  renderWithClient(<GoalSidebarList />);
  fireEvent.click(screen.getByRole('button', { name: '목표 추가' }));
  const input = screen.getByLabelText('새 목표 입력');
  fireEvent.change(input, { target: { value: 'x' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  await waitFor(() => expect(showToast).toHaveBeenCalledWith('목표 생성에 실패했어요'));
});

it('목표 선택 시 상세로 이동하고 onSelected를 호출한다', async () => {
  const onSelected = jest.fn();
  goalMock.getGoals.mockResolvedValue(page([item(5, '목표 A')]));
  renderWithClient(<GoalSidebarList onSelected={onSelected} />);
  openList();
  fireEvent.click(await screen.findByText('목표 A'));
  expect(push).toHaveBeenCalledWith('/goals/5');
  expect(onSelected).toHaveBeenCalled();
});
