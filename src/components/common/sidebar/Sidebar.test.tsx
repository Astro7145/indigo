jest.mock('next/navigation', () => ({ usePathname: () => '/' }));
jest.mock('@/src/components/goal/GoalSidebarList', () => ({ __esModule: true, default: () => null }));
jest.mock('./SidebarProfileButton', () => ({ __esModule: true, default: () => null }));
jest.mock('./SidebarNotification', () => ({ __esModule: true, default: () => null }));
jest.mock('./LogoutButton', () => ({ __esModule: true, default: () => null }));
jest.mock('@/src/components/todo/TodoFormSheet', () => ({
  __esModule: true,
  default: ({ mode, isOpen }: { mode: string; isOpen: boolean }) => (isOpen ? <div>{`sheet:${mode}`}</div> : null),
}));

import { fireEvent, render, screen } from '@testing-library/react';

import Sidebar from './Sidebar';

beforeEach(() => {
  // 데스크톱(태블릿 아님)으로 두어 사이드바가 펼쳐진 상태(새 할일 버튼 노출)가 되게 한다
  window.matchMedia = jest.fn().mockReturnValue({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }) as unknown as typeof window.matchMedia;
});

it('처음에는 할 일 생성 폼이 열려 있지 않다', () => {
  render(<Sidebar />);
  expect(screen.queryByText('sheet:create')).not.toBeInTheDocument();
});

it('새 할일 버튼을 누르면 할 일 생성 폼이 열린다', () => {
  render(<Sidebar />);
  fireEvent.click(screen.getByText('새 할일'));
  expect(screen.getByText('sheet:create')).toBeInTheDocument();
});
