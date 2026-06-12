jest.mock('@/src/hooks/todo', () => ({ useDeleteTodo: jest.fn() }));
jest.mock('@/src/hooks/useToast', () => ({ useToast: jest.fn() }));

import { fireEvent, render, screen } from '@testing-library/react';

import TodoDeleteConfirm from '@/src/components/common/todo-list/TodoDeleteConfirm';
import * as todoHooks from '@/src/hooks/todo';
import * as toastHook from '@/src/hooks/useToast';
import type { Todo } from '@/src/types/todo';

const mockedUseDeleteTodo = todoHooks.useDeleteTodo as jest.MockedFunction<typeof todoHooks.useDeleteTodo>;
const mockedUseToast = toastHook.useToast as jest.MockedFunction<typeof toastHook.useToast>;

const mockMutate = jest.fn();
const mockShowToast = jest.fn();

const makeTodo = (id: number, title: string): Todo => ({
  id,
  teamId: 't',
  userId: 1,
  goalId: null,
  title,
  done: false,
  fileUrl: null,
  linkUrl: null,
  dueDate: null,
  createdAt: '2026-05-20T00:00:00Z',
  updatedAt: '2026-05-20T00:00:00Z',
  goal: null,
  noteIds: [],
  tags: [],
  isFavorite: false,
});

const setDeleteState = (isPending = false) =>
  mockedUseDeleteTodo.mockReturnValue({
    mutate: mockMutate,
    isPending,
  } as unknown as ReturnType<typeof todoHooks.useDeleteTodo>);

beforeEach(() => {
  jest.clearAllMocks();
  setDeleteState();
  mockedUseToast.mockReturnValue({ showToast: mockShowToast, hideToast: jest.fn() });
});

it('확인을 누르면 해당 할 일이 삭제되고 닫힌다', () => {
  mockMutate.mockImplementation((_id: number, opts?: { onSuccess?: () => void }) => opts?.onSuccess?.());
  const onClose = jest.fn();
  render(<TodoDeleteConfirm open todo={makeTodo(7, '운동')} onClose={onClose} />);

  fireEvent.click(screen.getByRole('button', { name: '확인' }));

  expect(mockMutate).toHaveBeenCalledWith(7, expect.any(Object));
  expect(mockShowToast).toHaveBeenCalledWith('할 일이 삭제되었습니다.');
  expect(onClose).toHaveBeenCalled();
});

it('취소를 누르면 삭제 없이 닫힌다', () => {
  const onClose = jest.fn();
  render(<TodoDeleteConfirm open todo={makeTodo(7, '운동')} onClose={onClose} />);

  fireEvent.click(screen.getByRole('button', { name: '취소' }));

  expect(mockMutate).not.toHaveBeenCalled();
  expect(onClose).toHaveBeenCalled();
});

it('삭제에 실패하면 실패 토스트를 띄우고 닫지 않는다', () => {
  mockMutate.mockImplementation((_id: number, opts?: { onError?: () => void }) => opts?.onError?.());
  const onClose = jest.fn();
  render(<TodoDeleteConfirm open todo={makeTodo(7, '운동')} onClose={onClose} />);

  fireEvent.click(screen.getByRole('button', { name: '확인' }));

  expect(mockShowToast).toHaveBeenCalledWith('할 일 삭제에 실패했습니다.');
  expect(onClose).not.toHaveBeenCalled();
});

it('삭제 진행 중에는 확인 버튼을 누를 수 없다', () => {
  setDeleteState(true);
  render(<TodoDeleteConfirm open todo={makeTodo(7, '운동')} onClose={jest.fn()} />);

  expect(screen.getByRole('button', { name: '확인' })).toBeDisabled();
});

it('경고 문구로 복구 불가를 안내한다', () => {
  render(<TodoDeleteConfirm open todo={makeTodo(7, '운동')} onClose={jest.fn()} />);

  expect(screen.getByText('정말 삭제하시겠어요?')).toBeInTheDocument();
  expect(screen.getByText('삭제된 할 일은 복구할 수 없습니다.')).toBeInTheDocument();
});
