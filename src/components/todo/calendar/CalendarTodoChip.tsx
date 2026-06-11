import { IcCheck } from '@/src/components/common/icons/IcCheck';
import type { Todo } from '@/src/types/todo';
import { cn } from '@/src/utils/cn';

export interface CalendarTodoChipProps {
  todo: Todo;
  onClick: (todo: Todo) => void;
  className?: string;
}

/**
 * 캘린더 할일 칩 — 미완료=인디고, 완료=슬레이트+체크(표시 전용, 토글은 상세 시트에서).
 * 월 그리드 셀(xl)과 선택 날짜 리스트(<xl)가 공유한다. Figma 21209:51959.
 */
export default function CalendarTodoChip({ todo, onClick, className }: CalendarTodoChipProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        // 셀 클릭(날짜 선택)으로 전파 방지
        e.stopPropagation();
        onClick(todo);
      }}
      className={cn(
        'flex w-full items-center gap-0.5 rounded-[6px] border px-2 py-1 text-left',
        todo.done ? 'border-slate-300 bg-slate-50' : 'border-indigo-300 bg-indigo-100',
        className,
      )}
    >
      {todo.done && <IcCheck aria-hidden className="size-4 shrink-0 text-slate-400" />}
      <span
        className={cn(
          'min-w-0 flex-1 truncate text-xs font-semibold',
          todo.done ? 'text-slate-400' : 'text-indigo-600',
        )}
      >
        {todo.title}
      </span>
    </button>
  );
}
