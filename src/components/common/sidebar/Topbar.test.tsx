jest.mock('@/src/hooks/usePageTitle', () => ({ usePageTitle: () => '대시보드' }));
jest.mock('@/src/components/goal/GoalSidebarList', () => ({ __esModule: true, default: () => null }));
jest.mock('./SidebarProfileButton', () => ({ __esModule: true, default: () => null }));
jest.mock('./SidebarNotificationButton', () => ({ __esModule: true, default: () => null }));
jest.mock('./TopbarNotification', () => ({ __esModule: true, default: () => null }));
jest.mock('./LogoutButton', () => ({ __esModule: true, default: () => null }));
const mockOpenCreate = jest.fn();
jest.mock('@/src/hooks/useTodoSheet', () => ({
  useTodoSheet: () => ({ openCreate: mockOpenCreate, openEdit: jest.fn(), openDetail: jest.fn() }),
}));

import { fireEvent, render, screen } from '@testing-library/react';

import Topbar from './Topbar';

it('처음에는 할 일 생성 폼을 열지 않는다', () => {
  render(<Topbar />);
  expect(mockOpenCreate).not.toHaveBeenCalled();
});

it('새 할일 버튼을 누르면 생성 시트를 연다', () => {
  render(<Topbar />);
  fireEvent.click(screen.getByText('새 할일'));
  expect(mockOpenCreate).toHaveBeenCalledTimes(1);
});

beforeEach(() => jest.clearAllMocks());
