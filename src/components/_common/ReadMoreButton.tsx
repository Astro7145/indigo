import { IcChevron } from '@/src/components/common/icons/IcChevron'
import { cn } from '@/src/utils/cn'
// 양방향 토글이 필요한 경우 아래 주석 해제
// interface ReadMoreButtonProps {
//   isOpen: boolean
//   onClick: () => void
//   className?: string
// }

interface ReadMoreButtonProps {
  onClick: () => void
  className?: string
}

/**
 * 더보기 버튼. 단방향으로 콘텐츠를 추가로 호출할 때 사용
 *
 * @param onClick   더보기 핸들러. 클릭 시 숨겨진 콘텐츠를 노출
 * @param className 추가 Tailwind 클래스
 *
 * @example
 * // 단방향: 클릭 시 더보기 후 버튼 숨김
 * <ReadMoreButton onClick={handleLoadMore} />
 *
 * // 사용 예 (부모에서 노출 여부 제어)
 * {!isExpanded && <ReadMoreButton onClick={() => setIsExpanded(true)} />}
 */
export default function ReadMoreButton({
  onClick,
  className,
}: ReadMoreButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="더보기"
      className={cn(
        'flex size-[40px] cursor-pointer items-center justify-center rounded border border-slate-200 bg-white transition-colors hover:border-slate-400',
        className,
      )}
    >
      <IcChevron direction="down" />

      {/* ── 양방향 토글이 필요한 경우 아래 주석 해제 ── */}
      {/* {isOpen
        ? <IcChevron direction="up" />
        : <IcChevron direction="down" />
      } */}
    </button>
  )
}
