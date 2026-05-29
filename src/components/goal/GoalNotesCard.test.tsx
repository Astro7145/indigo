jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

import { fireEvent, render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import GoalNotesCard from '@/src/components/goal/GoalNotesCard';

const mockPush = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
});

it('노트 모아보기 문구를 렌더한다', () => {
  render(<GoalNotesCard goalId={3} />);
  expect(screen.getByText('노트 모아보기')).toBeInTheDocument();
});

it('클릭 시 해당 목표의 노트 모아보기 경로로 이동한다', () => {
  render(<GoalNotesCard goalId={3} />);
  fireEvent.click(screen.getByRole('button', { name: /노트 모아보기/ }));
  expect(mockPush).toHaveBeenCalledWith('/goals/3/notes');
});
