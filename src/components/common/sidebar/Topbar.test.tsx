jest.mock('@/src/hooks/usePageTitle', () => ({ usePageTitle: () => '대시보드' }));
jest.mock('@/src/components/goal/GoalSidebarList', () => ({ __esModule: true, default: () => null }));
jest.mock('./SidebarProfileButton', () => ({ __esModule: true, default: () => null }));
jest.mock('./SidebarNotificationButton', () => ({ __esModule: true, default: () => null }));
jest.mock('./TopbarNotification', () => ({ __esModule: true, default: () => null }));
jest.mock('./LogoutButton', () => ({ __esModule: true, default: () => null }));
jest.mock('@/src/components/todo/TodoFormSheet', () => ({
  __esModule: true,
  default: ({ mode, isOpen }: { mode: string; isOpen: boolean }) => (isOpen ? <div>{`sheet:${mode}`}</div> : null),
}));

import { fireEvent, render, screen } from '@testing-library/react';

import { useTopbarSlotStore } from '@/src/stores/topbarSlot';
import Topbar from './Topbar';

beforeEach(() => {
  useTopbarSlotStore.setState({ rightSlot: null });
});

it('처음에는 할 일 생성 폼이 열려 있지 않다', () => {
  render(<Topbar />);
  expect(screen.queryByText('sheet:create')).not.toBeInTheDocument();
});

it('새 할일 버튼을 누르면 할 일 생성 폼이 열린다', () => {
  render(<Topbar />);
  fireEvent.click(screen.getByText('새 할일'));
  expect(screen.getByText('sheet:create')).toBeInTheDocument();
});

it('store에 등록된 rightSlot이 우측 영역에 노출된다', () => {
  useTopbarSlotStore.setState({ rightSlot: <span>action-slot</span> });
  render(<Topbar />);
  expect(screen.getByText('action-slot')).toBeInTheDocument();
});

it('rightSlot이 없으면 슬롯 콘텐츠가 노출되지 않는다', () => {
  render(<Topbar />);
  expect(screen.queryByText('action-slot')).not.toBeInTheDocument();
});
