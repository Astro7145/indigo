import { render, screen } from '@testing-library/react';

import GoalNotesCard from '@/src/components/goal/GoalNotesCard';

it('노트 모아보기 문구를 렌더한다', () => {
  render(<GoalNotesCard goalId={3} />);
  expect(screen.getByText('노트 모아보기')).toBeInTheDocument();
});

it('해당 목표의 노트 모아보기 경로로 가는 링크를 렌더한다', () => {
  render(<GoalNotesCard goalId={3} />);
  expect(screen.getByRole('link', { name: /노트 모아보기/ })).toHaveAttribute('href', '/goals/3/notes');
});
