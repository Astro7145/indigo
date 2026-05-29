jest.mock('@/src/api/goal', () => ({
  ...jest.requireActual('@/src/api/goal'),
  getGoal: jest.fn(),
  getGoals: jest.fn(),
}));
jest.mock('@/src/api/user', () => ({
  ...jest.requireActual('@/src/api/user'),
  getMe: jest.fn(),
}));
jest.mock('@/src/api/todo', () => ({
  ...jest.requireActual('@/src/api/todo'),
  getTodos: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

import { screen } from '@testing-library/react';

import * as goalApi from '@/src/api/goal';
import * as todoApi from '@/src/api/todo';
import * as userApi from '@/src/api/user';
import GoalDetail from '@/src/components/goal/GoalDetail';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';
import { useRouter } from 'next/navigation';

beforeEach(() => {
  jest.resetAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
  (todoApi.getTodos as jest.Mock).mockResolvedValue({ todos: [], nextCursor: null, totalCount: 0 });
});

it('페이지 타이틀(유저명)과 목표명을 렌더한다', async () => {
  (goalApi.getGoal as jest.Mock).mockResolvedValue({ id: 3, title: '자바스크립트로 웹 서비스 만들기', todos: [] });
  (userApi.getMe as jest.Mock).mockResolvedValue({ id: 1, name: '체다치즈' });

  renderWithClient(<GoalDetail goalId={3} />);

  expect(await screen.findByText('자바스크립트로 웹 서비스 만들기')).toBeInTheDocument();
  expect(await screen.findByText('체다치즈님의 목표')).toBeInTheDocument();
});
