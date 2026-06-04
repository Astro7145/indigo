jest.mock('@/src/api/goal', () => ({
  ...jest.requireActual('@/src/api/goal'),
  deleteGoal: jest.fn(),
}));

import { fireEvent, screen, waitFor } from '@testing-library/react';

import * as goalApi from '@/src/api/goal';
import GoalDeleteModal from '@/src/components/goal/GoalDeleteModal';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';

const mocked = goalApi as jest.Mocked<typeof goalApi>;

beforeEach(() => jest.resetAllMocks());

it('삭제 경고 문구를 보여준다', () => {
  renderWithClient(<GoalDeleteModal onClose={() => {}} goalId={3} onDeleted={() => {}} />);
  expect(screen.getByText('정말 삭제하시겠어요?')).toBeInTheDocument();
  expect(screen.getByText('삭제된 목표는 복구할 수 없습니다.')).toBeInTheDocument();
});

it('확인 클릭 시 목표를 삭제하고 onDeleted를 호출한다', async () => {
  mocked.deleteGoal.mockResolvedValue(undefined as never);
  const onDeleted = jest.fn();
  renderWithClient(<GoalDeleteModal onClose={() => {}} goalId={3} onDeleted={onDeleted} />);
  fireEvent.click(screen.getByRole('button', { name: '확인' }));
  await waitFor(() => expect(mocked.deleteGoal).toHaveBeenCalledWith(3));
  await waitFor(() => expect(onDeleted).toHaveBeenCalled());
});
