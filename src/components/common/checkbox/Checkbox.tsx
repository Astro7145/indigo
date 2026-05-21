import { InputHTMLAttributes, ReactNode, Ref } from 'react'

import { IcCheckboxPrimary } from '@/src/components/common/icons/IcCheckboxPrimary'
import { IcCheckboxWhite } from '@/src/components/common/icons/IcCheckboxWhite'
import { cn } from '@/src/utils/cn'

export type CheckboxVariant = 'primary' | 'white'

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type'
> {
  /** 아이콘 스타일. 기본 'primary'. 밝은/컬러 배경 위에는 'white' */
  variant?: CheckboxVariant
  /** React 19 ref-as-prop — native input에 부착 (react-hook-form register 호환) */
  ref?: Ref<HTMLInputElement>
  /** 체크박스 옆 라벨 */
  children?: ReactNode
}

const iconByVariant = {
  primary: IcCheckboxPrimary,
  white: IcCheckboxWhite,
} as const

/** 두 아이콘 공통 — 포커스 링/disabled 시각 처리. peer(input)의 직접 형제여야 modifier가 동작 */
const ICON_BASE =
  'shrink-0 rounded-sm peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-disabled:opacity-50'

/**
 * 공통 Checkbox — 시각적으로 숨긴 native `<input type="checkbox">` 위에
 * `IcCheckbox*` 아이콘을 합성한다. 아이콘 토글은 CSS `peer-checked:`로 처리해
 * controlled·uncontrolled 모두 동작하고 react-hook-form(uncontrolled)과도 호환된다.
 *
 * `InputHTMLAttributes`를 확장하므로 `checked`/`defaultChecked`/`onChange`/
 * `name`/`value`/`disabled` 등 input 속성을 그대로 전달한다.
 *
 * @example
 * <Checkbox name="agree">이용약관 동의</Checkbox>
 * @example
 * // react-hook-form
 * <Checkbox {...register('agree')} />
 */
export default function Checkbox({
  variant = 'primary',
  className,
  style,
  children,
  disabled,
  ref,
  ...rest
}: CheckboxProps) {
  const Icon = iconByVariant[variant]
  return (
    <label
      style={style}
      className={cn(
        'inline-flex items-center gap-2 select-none text-slate-700',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        className,
      )}
    >
      <input
        ref={ref}
        disabled={disabled}
        className="peer sr-only"
        {...rest}
        type="checkbox"
      />
      <Icon
        aria-hidden="true"
        state="default"
        className={cn(ICON_BASE, 'peer-checked:hidden')}
      />
      <Icon
        aria-hidden="true"
        state="active"
        className={cn(ICON_BASE, 'hidden peer-checked:block')}
      />
      {children && (
        <span className="text-sm peer-disabled:text-slate-400">
          {children}
        </span>
      )}
    </label>
  )
}
