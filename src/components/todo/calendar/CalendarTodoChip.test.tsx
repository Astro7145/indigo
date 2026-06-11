import { fireEvent, render, screen } from '@testing-library/react';

import CalendarTodoChip from '@/src/components/todo/calendar/CalendarTodoChip';
import type { Todo } from '@/src/types/todo';

const makeTodo = (overrides?: Partial<Todo>): Todo => ({
  id: 1,
  teamId: 't',
  userId: 1,
  goalId: null,
  title: '챕터1 듣기',
  done: false,
  fileUrl: null,
  linkUrl: null,
  dueDate: '2025-01-10T00:00:00Z',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  goal: null,
  noteIds: [],
  tags: [],
  isFavorite: false,
  ...overrides,
});

it('제목을 렌더하고 클릭하면 해당 todo로 onClick을 호출한다', () => {
  const onClick = jest.fn();
  render(<CalendarTodoChip todo={makeTodo()} onClick={onClick} />);
  fireEvent.click(screen.getByText('챕터1 듣기'));
  expect(onClick).toHaveBeenCalledTimes(1);
  expect(onClick.mock.calls[0][0]).toMatchObject({ id: 1 });
});

it('완료 todo는 체크 아이콘을 표시한다', () => {
  const { container } = render(<CalendarTodoChip todo={makeTodo({ done: true })} onClick={() => {}} />);
  expect(container.querySelector('svg')).toBeInTheDocument();
});

it('미완료 todo는 체크 아이콘이 없다', () => {
  const { container } = render(<CalendarTodoChip todo={makeTodo()} onClick={() => {}} />);
  expect(container.querySelector('svg')).not.toBeInTheDocument();
});

it('완료 todo는 스크린리더용 완료 표시를 포함한다', () => {
  render(<CalendarTodoChip todo={makeTodo({ done: true })} onClick={() => {}} />);
  expect(screen.getByText('(완료)')).toBeInTheDocument();
});

it('disabled면 비활성화되고 클릭해도 onClick이 호출되지 않는다', () => {
  const onClick = jest.fn();
  render(<CalendarTodoChip todo={makeTodo()} onClick={onClick} disabled />);
  const button = screen.getByText('챕터1 듣기').closest('button');
  expect(button).toBeDisabled();
  fireEvent.click(screen.getByText('챕터1 듣기'));
  expect(onClick).not.toHaveBeenCalled();
});

it('클릭이 부모(셀 날짜 선택)로 전파되지 않는다', () => {
  const onParent = jest.fn();
  render(
    <div onClick={onParent}>
      <CalendarTodoChip todo={makeTodo()} onClick={() => {}} />
    </div>,
  );
  fireEvent.click(screen.getByText('챕터1 듣기'));
  expect(onParent).not.toHaveBeenCalled();
});
