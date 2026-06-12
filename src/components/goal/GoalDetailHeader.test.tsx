jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

import { fireEvent, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import GoalDetailHeader from '@/src/components/goal/GoalDetailHeader';
import { renderWithIntl } from '@/src/hooks/__tests__/test-utils';

beforeEach(() => {
  jest.resetAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
});

it('목표명을 렌더한다', async () => {
  await renderWithIntl(<GoalDetailHeader goalId={3} title="자바스크립트로 웹 서비스 만들기" />);
  expect(screen.getByText('자바스크립트로 웹 서비스 만들기')).toBeInTheDocument();
});

it('더보기(케밥) 버튼을 렌더한다', async () => {
  await renderWithIntl(<GoalDetailHeader goalId={3} title="목표" />);
  expect(screen.getByRole('button', { name: '목표 더보기 메뉴' })).toBeInTheDocument();
});

it('케밥 클릭 시 수정하기·삭제하기 메뉴가 열린다', async () => {
  await renderWithIntl(<GoalDetailHeader goalId={3} title="목표" />);
  fireEvent.click(screen.getByRole('button', { name: '목표 더보기 메뉴' }));
  expect(screen.getByRole('menuitem', { name: '수정하기' })).toBeInTheDocument();
  expect(screen.getByRole('menuitem', { name: '삭제하기' })).toBeInTheDocument();
});
