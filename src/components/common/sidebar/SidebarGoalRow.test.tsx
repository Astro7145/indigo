import { act, fireEvent, render, screen } from '@testing-library/react';

import SidebarGoalRow from '@/src/components/common/sidebar/SidebarGoalRow';

// IntersectionObserver shim — 콜백을 잡아 교차를 수동 트리거
let ioCb: ((entries: { isIntersecting: boolean }[]) => void) | null = null;
class IO {
  constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
    ioCb = cb;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-expect-error test shim
global.IntersectionObserver = IO;

beforeEach(() => {
  ioCb = null;
});

// 목록 영역은 "목표" 토글을 눌러야 펼쳐진다
const openList = () => fireEvent.click(screen.getByRole('button', { name: '목표' }));

it('로딩 중이면 안내 텍스트를 보여준다', () => {
  render(<SidebarGoalRow goals={[]} isLoading />);
  openList();
  expect(screen.getByText('불러오는 중…')).toBeInTheDocument();
});

it('목표가 없으면 빈 상태 텍스트를 보여준다', () => {
  render(<SidebarGoalRow goals={[]} />);
  openList();
  expect(screen.getByText('목표가 없어요')).toBeInTheDocument();
});

it('목표 목록을 렌더하고 항목 클릭 시 onSelectGoal을 호출한다', () => {
  const onSelectGoal = jest.fn();
  render(<SidebarGoalRow goals={[{ id: 7, title: '목표 A' }]} onSelectGoal={onSelectGoal} />);
  openList();
  fireEvent.click(screen.getByText('목표 A'));
  expect(onSelectGoal).toHaveBeenCalledWith(7);
});

it('hasNextPage면 sentinel 교차 시 onLoadMore를 호출한다', () => {
  const onLoadMore = jest.fn();
  render(<SidebarGoalRow goals={[{ id: 1, title: 'g1' }]} hasNextPage onLoadMore={onLoadMore} />);
  openList();
  act(() => ioCb?.([{ isIntersecting: true }]));
  expect(onLoadMore).toHaveBeenCalled();
});

it('목표 추가 입력에 Enter 시 onCreateGoal을 호출한다', () => {
  const onCreateGoal = jest.fn();
  render(<SidebarGoalRow goals={[]} onCreateGoal={onCreateGoal} />);
  fireEvent.click(screen.getByRole('button', { name: '목표 추가' }));
  const input = screen.getByLabelText('새 목표 입력');
  fireEvent.change(input, { target: { value: '새 목표' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(onCreateGoal).toHaveBeenCalledWith('새 목표');
});

it('IME 조합 중 Enter(한글 마지막 글자 확정)에는 onCreateGoal을 호출하지 않는다', () => {
  const onCreateGoal = jest.fn();
  render(<SidebarGoalRow goals={[]} onCreateGoal={onCreateGoal} />);
  fireEvent.click(screen.getByRole('button', { name: '목표 추가' }));
  const input = screen.getByLabelText('새 목표 입력');
  fireEvent.change(input, { target: { value: '새 목표' } });
  fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
  expect(onCreateGoal).not.toHaveBeenCalled();
});

it('Enter 버튼 클릭 시 onCreateGoal을 호출한다(IME 조합과 무관)', () => {
  const onCreateGoal = jest.fn();
  render(<SidebarGoalRow goals={[]} onCreateGoal={onCreateGoal} />);
  fireEvent.click(screen.getByRole('button', { name: '목표 추가' }));
  const input = screen.getByLabelText('새 목표 입력');
  fireEvent.change(input, { target: { value: '새 목표' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enter' }));
  expect(onCreateGoal).toHaveBeenCalledWith('새 목표');
});
