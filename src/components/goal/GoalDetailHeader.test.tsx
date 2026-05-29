import { render, screen } from '@testing-library/react';

import GoalDetailHeader from '@/src/components/goal/GoalDetailHeader';

it('목표명을 렌더한다', () => {
  render(<GoalDetailHeader title="자바스크립트로 웹 서비스 만들기" />);
  expect(screen.getByText('자바스크립트로 웹 서비스 만들기')).toBeInTheDocument();
});

it('더보기(케밥) 버튼을 렌더한다', () => {
  render(<GoalDetailHeader title="목표" />);
  expect(screen.getByRole('button', { name: '목표 더보기 메뉴' })).toBeInTheDocument();
});
