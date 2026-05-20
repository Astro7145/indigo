import { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/src/utils/cn'

/**
 * 버튼 시각적 스타일 계층
 *
 * - `primary`  : 채워진 indigo 버튼. 페이지 내 핵심 단일 액션에 사용
 * - `secondary`: 테두리 indigo 버튼. 주요 액션의 보조 옵션에 사용
 * - `tertiary` : 테두리 회색 버튼. 낮은 우선순위 액션(취소, 닫기 등)에 사용
 */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary'
export type ButtonSize = 'large' | 'medium' | 'small'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  startIcon?: ReactNode
  /** true이면 hover 스타일 적용. 기본값 false */
  hover?: boolean
}

/** size별 padding·font 클래스. 너비는 고정하지 않으며 className으로 지정 */
const sizeClasses: Record<ButtonSize, string> = {
  large: 'py-[13px] text-lg',
  medium: 'py-[11px] text-base',
  small: 'py-[9px] text-sm',
}

/** variant별 기본(default) 클래스. primary는 secondary·tertiary와 높이 맞춤을 위해 투명 border 포함 */
const variantBaseClasses: Record<ButtonVariant, string> = {
  primary: 'border border-transparent bg-indigo-600 text-white',
  secondary: 'border border-indigo-500 bg-transparent text-indigo-600',
  tertiary: 'border border-slate-300 bg-transparent text-slate-500',
}

/** variant별 hover 클래스. hover={true}일 때만 적용 */
const variantHoverClasses: Record<ButtonVariant, string> = {
  primary: 'hover:bg-indigo-700',
  secondary: 'hover:border-indigo-600',
  tertiary: 'hover:border-[#BBBBBB] hover:text-slate-600',
}

/**
 * variant별 disabled 클래스
 * ⚠️ #BBBBBB는 디자인 토큰 미등록 — globals.css 추가 검토 필요
 */
const variantDisabledClasses: Record<ButtonVariant, string> = {
  primary: 'disabled:cursor-not-allowed disabled:bg-[#BBBBBB]',
  secondary:
    'disabled:cursor-not-allowed disabled:border-[#BBBBBB] disabled:text-[#BBBBBB]',
  tertiary:
    'disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-[#BBBBBB]',
}

/**
 * 프로젝트 공통 Button 컴포넌트
 *
 * `ButtonHTMLAttributes<HTMLButtonElement>`를 확장하므로 `onClick`, `type`,
 * `form` 등 HTML 기본 button 속성을 그대로 전달할 수 있음.
 *
 * @param variant   버튼 계층 스타일. 기본값 `"primary"`
 * @param size      버튼 크기(높이·폰트만 고정, 너비는 콘텐츠에 맞게 자동). 기본값 `"large"`
 * @param startIcon 버튼 텍스트 앞 아이콘(ReactNode). 전달하지 않으면 렌더링되지 않음
 * @param hover     `true`이면 CSS hover 효과를 적용. 기본값 `false`
 * @param disabled  HTML button `disabled`와 동일하게 동작
 * @param className 추가 Tailwind 클래스. `cn()`으로 병합되므로 기본 스타일 오버라이드 가능
 * @param children  버튼 텍스트 또는 콘텐츠
 *
 * @example
 * <Button onClick={handleSave}>저장하기</Button>
 *
 * @example
 * <Button variant="secondary" size="medium" startIcon={<PlusIcon />}>할일 추가</Button>
 *
 * @example
 * <Button variant="tertiary" size="small" disabled>취소</Button>
 *
 * @example
 * <Button type="submit">저장</Button>
 */
export default function Button({
  variant = 'primary',
  size = 'large',
  startIcon,
  hover = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-1 rounded px-[18px] font-semibold tracking-[-0.03em] transition-colors select-none',
        sizeClasses[size],
        variantBaseClasses[variant],
        hover && variantHoverClasses[variant],
        variantDisabledClasses[variant],
        className,
      )}
      {...props}
    >
      {startIcon && <span className="shrink-0">{startIcon}</span>}
      {children}
    </button>
  )
}
