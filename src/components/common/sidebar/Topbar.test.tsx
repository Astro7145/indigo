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

import { useTopbarSlotStore } from '@/src/stores/topbarSlot';
import Topbar from './Topbar';

beforeEach(() => {
  useTopbarSlotStore.setState({ rightSlot: null });
  jest.clearAllMocks();
});

it('처음에는 할 일 생성 폼을 열지 않는다', () => {
  render(<Topbar />);
  expect(mockOpenCreate).not.toHaveBeenCalled();
});

it('새 할일 버튼을 누르면 생성 시트를 연다', () => {
  render(<Topbar />);
  fireEvent.click(screen.getByText('새 할일'));
  expect(mockOpenCreate).toHaveBeenCalledTimes(1);
});

it('햄버거를 누르면 메뉴가 펼쳐진다', () => {
  render(<Topbar />);
  // inert는 펼침 메뉴 컨테이너(pb-12)에 걸린다. 스크롤 영역이 분리되며 overflow-y-auto가 내부로 옮겨가서 pb-12로 찾는다
  const menu = screen.getByLabelText('메뉴 접기').closest('.pb-12');
  // 접힘 상태: 펼침 메뉴는 inert(비활성). 펼치면 inert가 제거된다
  expect(menu).toHaveAttribute('inert');
  fireEvent.click(screen.getByLabelText('메뉴 열기'));
  expect(menu).not.toHaveAttribute('inert');
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
