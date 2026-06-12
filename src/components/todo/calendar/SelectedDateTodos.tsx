import type { CalendarDate } from '@internationalized/date';

import CalendarTodoChip from '@/src/components/todo/calendar/CalendarTodoChip';
import type { Todo } from '@/src/types/todo';

export interface SelectedDateTodosProps {
  date: CalendarDate;
  todos: Todo[];
  onSelectTodo: (todo: Todo) => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * 그리드 아래 선택 날짜의 할일 리스트 — 태블릿·모바일 전용(xl:hidden은 호출 측이 지정).
 * Figma 21209:62876(Selected date 섹션).
 */
export default function SelectedDateTodos({ date, todos, onSelectTodo }: SelectedDateTodosProps) {
  return (
    <section className="flex flex-col gap-4 px-4 py-5">
      <h3 className="text-sm leading-5 font-semibold text-slate-800">
        {date.year}. {pad(date.month)}. {pad(date.day)}
      </h3>
      {todos.length === 0 ? (
        <p className="py-2 text-center text-sm text-slate-500">등록된 할 일이 없어요</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {todos.map((t) => (
            <li key={t.id}>
              <CalendarTodoChip todo={t} onClick={onSelectTodo} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
