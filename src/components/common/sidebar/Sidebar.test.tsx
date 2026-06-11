jest.mock('next/navigation', () => ({ usePathname: () => '/' }));
jest.mock('@/src/components/goal/GoalSidebarList', () => ({ __esModule: true, default: () => null }));
jest.mock('./SidebarProfileButton', () => ({ __esModule: true, default: () => null }));
jest.mock('./SidebarNotification', () => ({ __esModule: true, default: () => null }));
jest.mock('./LogoutButton', () => ({ __esModule: true, default: () => null }));
const mockOpenCreate = jest.fn();
jest.mock('@/src/hooks/useTodoSheet', () => ({
  useTodoSheet: () => ({ openCreate: mockOpenCreate, openEdit: jest.fn(), openDetail: jest.fn() }),
}));

import { fireEvent, render, screen } from '@testing-library/react';

import Sidebar from './Sidebar';

beforeEach(() => {
  jest.clearAllMocks();
  // 데스크톱(태블릿 아님)으로 두어 사이드바가 펼쳐진 상태(새 할일 버튼 노출)가 되게 한다
  window.matchMedia = jest.fn().mockReturnValue({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }) as unknown as typeof window.matchMedia;
});

it('처음에는 할 일 생성 폼을 열지 않는다', () => {
  render(<Sidebar />);
  expect(mockOpenCreate).not.toHaveBeenCalled();
});

it('새 할일 버튼을 누르면 생성 시트를 연다', () => {
  render(<Sidebar />);
  fireEvent.click(screen.getByText('새 할일'));
  expect(mockOpenCreate).toHaveBeenCalledTimes(1);
});
