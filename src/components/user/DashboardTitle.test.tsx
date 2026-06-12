jest.mock('@/src/hooks/user', () => ({ useMe: jest.fn() }));

import { render, screen } from '@testing-library/react';

import DashboardTitle from '@/src/components/user/DashboardTitle';
import { useMe } from '@/src/hooks/user';

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(useMe).mockReturnValue({ data: { name: '체다치즈' } } as unknown as ReturnType<typeof useMe>);
});

it('사용자 이름으로 대시보드 헤더를 렌더한다', () => {
  render(<DashboardTitle />);
  expect(screen.getByTestId('user-name')).toHaveTextContent('체다치즈');
});
