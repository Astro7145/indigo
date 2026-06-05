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

// 자식 컬럼은 스텁으로 대체 — GoalDetail의 시트 배선만 검증한다.
type StubTodo = { id: number; title: string };
jest.mock('@/src/components/goal/GoalTodoColumn', () => ({
  __esModule: true,
  default: ({
    done,
    onEditTodo,
    onAddTodo,
    onSelectTodo,
  }: {
    done: boolean;
    onEditTodo: (t: StubTodo) => void;
    onAddTodo: (id: number) => void;
    onSelectTodo: (t: StubTodo) => void;
  }) => (
    <div>
      <button onClick={() => onEditTodo({ id: 1, title: '수정 대상' })}>{`stub-edit-${done ? 'done' : 'todo'}`}</button>
      <button onClick={() => onAddTodo(3)}>{`stub-add-${done ? 'done' : 'todo'}`}</button>
      <button onClick={() => onSelectTodo({ id: 1, title: '선택 대상' })}>
        {`stub-select-${done ? 'done' : 'todo'}`}
      </button>
    </div>
  ),
}));
jest.mock('@/src/components/todo/TodoFormSheet', () => ({
  __esModule: true,
  default: ({ mode, isOpen }: { mode: 'create' | 'update'; isOpen: boolean }) =>
    isOpen ? <div>{`form-sheet:${mode}`}</div> : null,
}));
jest.mock('@/src/components/todo/TodoDetailSheet', () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div>detail-sheet</div> : null),
}));

import { fireEvent, screen } from '@testing-library/react';

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

it('초기에는 어떤 시트도 열려 있지 않다', async () => {
  renderWithClient(<GoalDetail goalId={3} />);
  await screen.findAllByText('stub-add-todo');
  expect(screen.queryByText(/form-sheet:/)).not.toBeInTheDocument();
  expect(screen.queryByText('detail-sheet')).not.toBeInTheDocument();
});

it('할 일 수정을 시작하면 할 일 수정 시트가 열린다', async () => {
  renderWithClient(<GoalDetail goalId={3} />);
  fireEvent.click((await screen.findAllByText('stub-edit-todo'))[0]);
  expect(await screen.findByText('form-sheet:update')).toBeInTheDocument();
});

it('할 일 추가를 시작하면 할 일 생성 시트가 열린다', async () => {
  renderWithClient(<GoalDetail goalId={3} />);
  fireEvent.click((await screen.findAllByText('stub-add-todo'))[0]);
  expect(await screen.findByText('form-sheet:create')).toBeInTheDocument();
});

it('할 일을 선택하면 상세 시트가 열린다', async () => {
  renderWithClient(<GoalDetail goalId={3} />);
  fireEvent.click((await screen.findAllByText('stub-select-todo'))[0]);
  expect(await screen.findByText('detail-sheet')).toBeInTheDocument();
});
