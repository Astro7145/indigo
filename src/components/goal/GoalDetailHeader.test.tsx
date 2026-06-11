jest.mock('@/src/api/goal', () => ({
  ...jest.requireActual('@/src/api/goal'),
  getGoal: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

import { Suspense } from 'react';

import { fireEvent, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import * as goalApi from '@/src/api/goal';
import GoalDetailHeader from '@/src/components/goal/GoalDetailHeader';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';

beforeEach(() => {
  jest.resetAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
  (goalApi.getGoal as jest.Mock).mockResolvedValue({ id: 3, title: '목표', todos: [] });
});

function renderHeader() {
  return renderWithClient(
    <Suspense fallback={null}>
      <GoalDetailHeader goalId={3} />
    </Suspense>,
  );
}

it('목표명을 렌더한다', async () => {
  (goalApi.getGoal as jest.Mock).mockResolvedValue({ id: 3, title: '자바스크립트로 웹 서비스 만들기', todos: [] });
  renderHeader();
  expect(await screen.findByText('자바스크립트로 웹 서비스 만들기')).toBeInTheDocument();
});

it('더보기(케밥) 버튼을 렌더한다', async () => {
  renderHeader();
  expect(await screen.findByRole('button', { name: '목표 더보기 메뉴' })).toBeInTheDocument();
});

it('케밥 클릭 시 수정하기·삭제하기 메뉴가 열린다', async () => {
  renderHeader();
  fireEvent.click(await screen.findByRole('button', { name: '목표 더보기 메뉴' }));
  expect(screen.getByRole('menuitem', { name: '수정하기' })).toBeInTheDocument();
  expect(screen.getByRole('menuitem', { name: '삭제하기' })).toBeInTheDocument();
});
