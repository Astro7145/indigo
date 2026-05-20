import { cn } from '@/src/utils/cn'

/**
 * 칩스 타입
 * - `todo`: 연보라 배경 / indigo-700 텍스트
 * - `done`: 회색 배경 / 흰 텍스트
 */
export type ChipsType = 'todo' | 'done'

interface ChipsProps {
  type?: ChipsType
  className?: string
}

const typeStyles: Record<ChipsType, string> = {
  todo: 'bg-indigo-300 text-indigo-700',
  done: 'bg-slate-300 text-white',
}

const typeLabels: Record<ChipsType, string> = {
  todo: 'TO DO',
  done: 'DONE',
}

/**
 * 할일 상태 표시 칩스. 클릭 불가 표시 전용 컴포넌트
 *
 * @param type      칩스 타입. `"todo"` | `"done"`. 기본값 `"todo"`
 * @param className 추가 Tailwind 클래스
 *
 * @example
 * <Chips type="todo" />  // → "TO DO"
 * <Chips type="done" />  // → "DONE"
 */
export default function Chips({ type = 'todo', className }: ChipsProps) {
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
  )
}
