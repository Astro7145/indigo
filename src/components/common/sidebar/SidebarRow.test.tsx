import { fireEvent, render, screen } from '@testing-library/react';
import SidebarRow from '@/src/components/common/sidebar/SidebarRow';

describe('SidebarRow', () => {
  it('href가 있으면 링크로 렌더된다', () => {
    render(<SidebarRow type="dashboard" text="대시보드" href="/" />);
    expect(screen.getByRole('link', { name: '대시보드' })).toBeInTheDocument();
  });

  it('onClick이 있으면 버튼으로 렌더되고 클릭 시 onClick을 호출한다', () => {
    const onClick = jest.fn();
    render(<SidebarRow type="logout" text="로그아웃" onClick={onClick} />);
    const button = screen.getByRole('button', { name: '로그아웃' });
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
