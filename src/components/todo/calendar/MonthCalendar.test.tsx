import { useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { CalendarDate } from '@internationalized/date';

import MonthCalendar from '@/src/components/todo/calendar/MonthCalendar';
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

function Harness({
  todosByDate = new Map<string, Todo[]>(),
  onSelectTodo = () => {},
}: {
  todosByDate?: Map<string, Todo[]>;
  onSelectTodo?: (todo: Todo) => void;
}) {
  const [value, setValue] = useState(new CalendarDate(2025, 1, 10));
  return <MonthCalendar value={value} onChange={setValue} todosByDate={todosByDate} onSelectTodo={onSelectTodo} />;
}

it('현재 달 타이틀과 요일 헤더(월요일 시작)를 렌더한다', () => {
  render(<Harness />);
  expect(screen.getByText('2025년 1월')).toBeInTheDocument();
  // react-aria가 요일 헤더 행을 aria-hidden 처리(셀에 전체 날짜 라벨이 있어 중복) → 롤 대신 텍스트로 검증
  const headers = screen.getAllByText(/^[월화수목금토일]$/).map((th) => th.textContent);
  expect(headers).toEqual(['월', '화', '수', '목', '금', '토', '일']);
});

it('날짜가 월요일 시작 열에 맞게 배치된다 — 2025년 1월 첫 행은 12/30(월)~1/5(일)', () => {
  const { container } = render(<Harness />);
  const firstRow = container.querySelectorAll('tbody tr')[0];
  const days = Array.from(firstRow.querySelectorAll('td')).map((td) => td.querySelector('span')?.textContent);
  expect(days).toEqual(['30', '31', '1', '2', '3', '4', '5']);
});

it('해당 날짜 셀에 할일 칩을 렌더한다', () => {
  const map = new Map([['2025-01-10', [makeTodo(1, '챕터4 듣기')]]]);
  render(<Harness todosByDate={map} />);
  expect(screen.getByText('챕터4 듣기')).toBeInTheDocument();
});

it('할일이 3개를 넘으면 +N을 표시한다', () => {
  const map = new Map([['2025-01-10', [makeTodo(1, 'a'), makeTodo(2, 'b'), makeTodo(3, 'c'), makeTodo(4, 'd')]]]);
  render(<Harness todosByDate={map} />);
  expect(screen.getByText('+1')).toBeInTheDocument();
  expect(screen.queryByText('d')).not.toBeInTheDocument();
});

it('이전/다음 달 셀의 칩은 비활성화된다', () => {
  const map = new Map([['2024-12-30', [makeTodo(9, '저번달 할일')]]]);
  render(<Harness todosByDate={map} />);
  expect(screen.getByText('저번달 할일').closest('button')).toBeDisabled();
});

it('칩을 클릭하면 해당 todo로 onSelectTodo를 호출한다', () => {
  const onSelectTodo = jest.fn();
  const map = new Map([['2025-01-10', [makeTodo(7, '챕터4 듣기')]]]);
  render(<Harness todosByDate={map} onSelectTodo={onSelectTodo} />);
  fireEvent.click(screen.getByText('챕터4 듣기'));
  expect(onSelectTodo.mock.calls[0][0]).toMatchObject({ id: 7 });
});

it('이전 달 버튼을 누르면 타이틀이 전월로 바뀐다', () => {
  render(<Harness />);
  fireEvent.click(screen.getByLabelText(/이전/));
  expect(screen.getByText('2024년 12월')).toBeInTheDocument();
});

it('다음 달 버튼을 누르면 타이틀이 익월로 바뀐다', () => {
  render(<Harness />);
  fireEvent.click(screen.getByLabelText(/다음/));
  expect(screen.getByText('2025년 2월')).toBeInTheDocument();
});

it('날짜 셀을 클릭하면 그 날짜가 선택된다', () => {
  render(<Harness />);
  const grid = screen.getByRole('grid');
  // 셀 선택은 오버레이 버튼이 담당 — react-aria가 버튼에 전체 날짜 aria-label을 부여한다
  const cellButton = within(grid).getByRole('button', { name: /15,/ });
  fireEvent.click(cellButton);
  expect(cellButton.closest('[aria-selected]')).toHaveAttribute('aria-selected', 'true');
});
