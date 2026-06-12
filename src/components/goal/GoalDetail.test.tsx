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

// 자식 컬럼은 스텁으로 대체 — 시트 열기는 컬럼이 useTodoSheet로 직접 수행하므로(#136) 여기선 렌더만 검증한다.
jest.mock('@/src/components/goal/GoalTodoColumn', () => ({
  __esModule: true,
  default: ({ done }: { done: boolean }) => <div>{`stub-column-${done ? 'done' : 'todo'}`}</div>,
}));

import { screen } from '@testing-library/react';

import * as goalApi from '@/src/api/goal';
import * as userApi from '@/src/api/user';
import GoalDetail from '@/src/components/goal/GoalDetail';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';
import { useRouter } from 'next/navigation';

beforeEach(() => {
  jest.resetAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
  (goalApi.getGoal as jest.Mock).mockResolvedValue({ id: 3, title: '자바스크립트로 웹 서비스 만들기', todos: [] });
  (userApi.getMe as jest.Mock).mockResolvedValue({ id: 1, name: '체다치즈' });
});

it('페이지 타이틀(유저명)과 목표명을 렌더한다', async () => {
  renderWithClient(<GoalDetail goalId={3} />);
  expect(await screen.findByText('자바스크립트로 웹 서비스 만들기')).toBeInTheDocument();
  expect(await screen.findByText('체다치즈님의 목표')).toBeInTheDocument();
});

it('목표 조회 실패 시 에러 안내를 보여준다', async () => {
  (goalApi.getGoal as jest.Mock).mockRejectedValue(new Error('fail'));
  renderWithClient(<GoalDetail goalId={3} />);
  expect(await screen.findByText('목표 정보를 불러오지 못했어요')).toBeInTheDocument();
});
