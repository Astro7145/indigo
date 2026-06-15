jest.mock('@/src/components/common/graph/GraphView', () => ({
  __esModule: true,
  default: () => <div data-testid="graph-view">graph</div>,
}));

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardView from '@/src/components/common/graph/DashboardView';

it('기본은 대시보드를 보여주고 그래프는 숨긴다', () => {
  render(<DashboardView dashboard={<div data-testid="dash">dash</div>} />);
  expect(screen.getByTestId('dash')).toBeInTheDocument();
  expect(screen.queryByTestId('graph-view')).not.toBeInTheDocument();
});

it('우주 토글을 누르면 그래프로 전환된다', async () => {
  const user = userEvent.setup();
  render(<DashboardView dashboard={<div data-testid="dash">dash</div>} />);
  await user.click(screen.getByRole('button', { name: '우주' }));
  expect(screen.getByTestId('graph-view')).toBeInTheDocument();
  expect(screen.queryByTestId('dash')).not.toBeInTheDocument();
});
