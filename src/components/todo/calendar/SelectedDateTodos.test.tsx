import { fireEvent, render, screen } from '@testing-library/react';
import { CalendarDate } from '@internationalized/date';

import SelectedDateTodos from '@/src/components/todo/calendar/SelectedDateTodos';
import type { Todo } from '@/src/types/todo';

const makeTodo = (id: number, title: string, overrides?: Partial<Todo>): Todo => ({
  id,
  teamId: 't',
  userId: 1,
  goalId: null,
  title,
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

it('선택 날짜를 yyyy. mm. dd로 표시하고 할일을 렌더한다', () => {
  render(
    <SelectedDateTodos
      date={new CalendarDate(2025, 1, 10)}
      todos={[makeTodo(1, '챕터4 듣기'), makeTodo(2, '렌더링 구현', { done: true })]}
      onSelectTodo={() => {}}
    />,
  );
  expect(screen.getByText('2025. 01. 10')).toBeInTheDocument();
  expect(screen.getByText('챕터4 듣기')).toBeInTheDocument();
  expect(screen.getByText('렌더링 구현')).toBeInTheDocument();
});

it('할일이 없으면 안내 문구를 표시한다', () => {
  render(<SelectedDateTodos date={new CalendarDate(2025, 1, 10)} todos={[]} onSelectTodo={() => {}} />);
  expect(screen.getByText('등록된 할 일이 없어요')).toBeInTheDocument();
});

it('항목을 클릭하면 해당 todo로 onSelectTodo를 호출한다', () => {
  const onSelectTodo = jest.fn();
  render(
    <SelectedDateTodos
      date={new CalendarDate(2025, 1, 10)}
      todos={[makeTodo(3, '챕터4 듣기')]}
      onSelectTodo={onSelectTodo}
    />,
  );
  fireEvent.click(screen.getByText('챕터4 듣기'));
  expect(onSelectTodo.mock.calls[0][0]).toMatchObject({ id: 3 });
});
