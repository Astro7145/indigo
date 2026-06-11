import { cn } from '@/src/utils/cn';

export type CategoryTabLabel = 'ALL' | 'TO DO' | 'DONE';

interface CategoryTabProps {
  /** 탭에 표시할 텍스트. i18n 메시지를 주입받으므로 string. */
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * 할일 상태 필터 탭. ALL/TO DO/DONE 세 탭을 나란히 사용
 *
 * @param label     탭 텍스트. `"ALL"` | `"TO DO"` | `"DONE"`
 * @param isActive  활성 상태. 기본값 `false`
 * @param onClick   탭 클릭 핸들러
 * @param className 추가 Tailwind 클래스
 *
 * @example
 * <CategoryTab label="ALL" isActive onClick={() => setFilter('all')} />
 * <CategoryTab label="TO DO" onClick={() => setFilter('todo')} />
 * <CategoryTab label="DONE" onClick={() => setFilter('done')} />
 */
export default function CategoryTab({ label, isActive = false, onClick, className }: CategoryTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        'cursor-pointer rounded-[4px] px-4 py-2 text-base font-bold tracking-[-0.03em] transition-colors',
        isActive ? 'bg-indigo-700/20 text-indigo-600' : 'text-[#8b8b8b]', // ⚠️ 디자인 토큰 미등록 — globals.css 추가 검토 필요
        className,
      )}
    >
      {label}
    </button>
  );
}
