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

import { useModalStore } from '@/src/stores/modal';
import Sidebar from './Sidebar';

beforeEach(() => {
  jest.clearAllMocks();
  useModalStore.setState({ modals: [] });
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

it('N 단축키로 생성 시트를 연다', () => {
  render(<Sidebar />);
  fireEvent.keyDown(window, { key: 'n' });
  expect(mockOpenCreate).toHaveBeenCalledTimes(1);
});

it('입력 중에는 N 단축키가 동작하지 않는다', () => {
  render(
    <>
      <input aria-label="field" />
      <Sidebar />
    </>,
  );
  const input = screen.getByLabelText('field');
  input.focus();
  fireEvent.keyDown(input, { key: 'n' });
  expect(mockOpenCreate).not.toHaveBeenCalled();
});

it('조합키(meta/ctrl/alt)와 함께 누르면 동작하지 않는다', () => {
  render(<Sidebar />);
  fireEvent.keyDown(window, { key: 'n', metaKey: true });
  expect(mockOpenCreate).not.toHaveBeenCalled();
});

it('모달이 떠 있는 동안에는 N 단축키가 동작하지 않는다', () => {
  useModalStore.setState({ modals: [{ id: 'x', variant: 'auto', render: () => null }] });
  render(<Sidebar />);
  fireEvent.keyDown(window, { key: 'n' });
  expect(mockOpenCreate).not.toHaveBeenCalled();
});
