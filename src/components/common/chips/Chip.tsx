import { cn } from '@/src/utils/cn';

/**
 * 칩 타입
 * - `todo`: 연보라 배경 / indigo-700 텍스트
 * - `done`: 회색 배경 / 흰 텍스트
 */
export type ChipType = 'todo' | 'done';

interface ChipProps {
  type?: ChipType;
  className?: string;
}

const typeStyles: Record<ChipType, string> = {
  todo: 'bg-indigo-100 text-indigo-600',
  done: 'bg-slate-100 text-slate-400',
};

const typeLabels: Record<ChipType, string> = {
  todo: 'TO DO',
  done: 'DONE',
};

/**
 * 할일 상태 표시 칩. 클릭 불가 표시 전용 컴포넌트
 *
 * @param type      칩 타입. `"todo"` | `"done"`. 기본값 `"todo"`
 * @param className 추가 Tailwind 클래스
 *
 * @example
 * <Chip type="todo" />  // → "TO DO"
 * <Chip type="done" />  // → "DONE"
 */
export default function Chip({ type = 'todo', className }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex w-[48px] items-center justify-center rounded-[8px] px-[3px] py-[2px] text-xs font-semibold',
        typeStyles[type],
        className,
      )}
    >
      {typeLabels[type]}
    </span>
  );
}
