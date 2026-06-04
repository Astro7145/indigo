jest.mock('@/src/api/goal', () => ({
  ...jest.requireActual('@/src/api/goal'),
  patchGoal: jest.fn(),
}));

import { fireEvent, screen, waitFor } from '@testing-library/react';

import * as goalApi from '@/src/api/goal';
import GoalEditModal from '@/src/components/goal/GoalEditModal';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';

const mocked = goalApi as jest.Mocked<typeof goalApi>;

beforeEach(() => jest.resetAllMocks());

it('현재 목표명을 채워 보여준다', () => {
  renderWithClient(<GoalEditModal onClose={() => {}} goalId={3} currentTitle="기존 목표" />);
  expect(screen.getByDisplayValue('기존 목표')).toBeInTheDocument();
});

it('수정 후 확인 시 patchGoal을 호출하고 닫는다', async () => {
  mocked.patchGoal.mockResolvedValue({ id: 3 } as never);
  const onClose = jest.fn();
  renderWithClient(<GoalEditModal onClose={onClose} goalId={3} currentTitle="기존 목표" />);
  fireEvent.change(screen.getByDisplayValue('기존 목표'), { target: { value: '새 목표' } });
  fireEvent.click(screen.getByRole('button', { name: '확인' }));
  await waitFor(() => expect(mocked.patchGoal).toHaveBeenCalledWith(3, { title: '새 목표' }));
  await waitFor(() => expect(onClose).toHaveBeenCalled());
});

it('제목이 비면 확인 버튼이 비활성화된다', () => {
  renderWithClient(<GoalEditModal onClose={() => {}} goalId={3} currentTitle="" />);
  expect(screen.getByRole('button', { name: '확인' })).toBeDisabled();
});
