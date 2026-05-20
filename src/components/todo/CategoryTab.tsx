import { cn } from '@/src/utils/cn'

export type CategoryTabLabel = '전체' | 'To Do' | 'Done'

/**
 * CategoryTab 컴포넌트 props
 *
 * @param label     탭 텍스트. `"전체"` | `"To Do"` | `"Done"`
 * @param isActive  활성 상태. 기본값 `false`
 * @param onClick   탭 클릭 핸들러
 * @param className 추가 Tailwind 클래스
 *
 * @example
 * <CategoryTab label="전체" isActive onClick={() => setFilter('all')} />
 * <CategoryTab label="To Do" onClick={() => setFilter('todo')} />
 * <CategoryTab label="Done" onClick={() => setFilter('done')} />
 */
interface CategoryTabProps {
  label: CategoryTabLabel
  isActive?: boolean
  onClick: () => void
  className?: string
}

/** 할일 상태 필터 탭. 전체/To Do/Done 세 탭을 나란히 사용 */
export default function CategoryTab({
  label,
  isActive = false,
  onClick,
  className,
}: CategoryTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        'rounded-[4px] px-4 py-2 text-base font-bold tracking-[-0.03em] transition-colors',
        isActive
          ? 'bg-indigo-700/20 text-indigo-600'
          : 'text-[#8b8b8b]', // ⚠️ 디자인 토큰 미등록 — globals.css 추가 검토 필요
        className,
      )}
    >
      {label}
    </button>
  )
}
