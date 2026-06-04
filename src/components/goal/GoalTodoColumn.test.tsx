jest.mock('@/src/api/todo', () => ({
  ...jest.requireActual('@/src/api/todo'),
  getTodos: jest.fn(),
}));

import { screen } from '@testing-library/react';

import * as todoApi from '@/src/api/todo';
import GoalTodoColumn from '@/src/components/goal/GoalTodoColumn';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';

const mocked = todoApi as jest.Mocked<typeof todoApi>;

beforeEach(() => jest.resetAllMocks());

it('To do 컬럼은 받아온 할 일을 렌더한다', async () => {
  mocked.getTodos.mockResolvedValue({
    todos: [{ id: 1, title: '할 일 하나', done: false, noteIds: [], linkUrl: null, fileUrl: null, isFavorite: false }],
    nextCursor: null,
    totalCount: 1,
  } as never);
  renderWithClient(<GoalTodoColumn goalId={3} done={false} />);
  expect(await screen.findByText('할 일 하나')).toBeInTheDocument();
  expect(screen.getByText('TO DO')).toBeInTheDocument();
});

it('To do 컬럼은 goalId·done=false 필터로 조회한다', async () => {
  mocked.getTodos.mockResolvedValue({ todos: [], nextCursor: null, totalCount: 0 } as never);
  renderWithClient(<GoalTodoColumn goalId={3} done={false} />);
  await screen.findByText('해야할 일이 아직 없어요');
  expect(mocked.getTodos).toHaveBeenCalledWith(expect.objectContaining({ goalId: 3, done: 'false' }));
});

it('빈 Done 컬럼은 완료 안내 문구를 보여준다', async () => {
  mocked.getTodos.mockResolvedValue({ todos: [], nextCursor: null, totalCount: 0 } as never);
  renderWithClient(<GoalTodoColumn goalId={3} done />);
  expect(await screen.findByText('완료한 일이 아직 없어요')).toBeInTheDocument();
});
