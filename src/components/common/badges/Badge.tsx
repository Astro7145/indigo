import { ReactNode } from 'react'

import { IcBadgeClose } from '@/src/components/common/icons/IcBadgeClose'
import { cn } from '@/src/utils/cn'

export type BadgeColor = 'gray' | 'green' | 'yellow' | 'red' | 'purple'

interface BadgeProps {
  color?: BadgeColor
  children: ReactNode
  onDelete?: () => void
  className?: string
}

/** color별 배경·테두리·텍스트 클래스 */
const colorStyles: Record<BadgeColor, string> = {
  gray: 'bg-badge-gray-bg border-badge-gray-border text-badge-gray-text',
  green: 'bg-badge-green-bg border-badge-green-border text-badge-green-text',
  yellow: 'bg-badge-yellow-bg border-badge-yellow-border text-badge-yellow-text',
  red: 'bg-badge-red-bg border-badge-red-border text-badge-red-text',
  purple: 'bg-badge-purple-bg border-badge-purple-border text-badge-purple-text',
}

/**
 * 표시 전용 또는 삭제 가능한 태그 뱃지
 *
 * @param color     뱃지 색상. 기본값 `"gray"`
 * @param children  뱃지 텍스트
 * @param onDelete  전달하면 X 버튼 렌더링 + 클릭 시 호출. 없으면 표시 전용
 * @param className 추가 Tailwind 클래스
 *
 * @example
 * // 표시 전용
 * <Badge color="purple">디자인</Badge>
 *
 * @example
 * // 삭제 가능
 * <Badge color="green" onDelete={() => handleDelete(id)}>완료</Badge>
 */
export default function Badge({
  color = 'gray',
  children,
  onDelete,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-[2px] rounded-full border py-[3px] text-xs font-medium select-none',
        onDelete ? 'pr-[3px] pl-[8px]' : 'px-[8px]',
        colorStyles[color],
        className,
      )}
    >
      {children}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label="태그 삭제"
          className="flex cursor-pointer items-center justify-center rounded-full"
        >
          <IcBadgeClose color={color} />
        </button>
      )}
    </span>
  )
}
