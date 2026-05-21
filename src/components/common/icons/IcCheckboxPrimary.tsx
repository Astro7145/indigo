import { SVGProps } from 'react'
import { cn } from '@/src/utils/cn'

interface IcCheckboxPrimaryProps extends SVGProps<SVGSVGElement> {
  state?: 'default' | 'active'
}

export function IcCheckboxPrimary({
  state = 'default',
  className,
  ...rest
}: IcCheckboxPrimaryProps) {
  if (state === 'default') {
    return (
      <svg
        viewBox="0 0 18 18"
        fill="none"
        style={{ overflow: 'visible' }}
        className={cn('size-[18px]', className)}
        {...rest}
      >
        <rect
          x="0.5"
          y="0.5"
          width="17"
          height="17"
          rx="1.5"
          fill="var(--color-white)"
          stroke="var(--color-slate-300)"
        />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 18 18"
      fill="none"
      style={{ overflow: 'visible' }}
      className={cn('size-[18px]', className)}
      {...rest}
    >
      <rect width="18" height="18" rx="2" fill="var(--color-indigo-700)" />
      <path
        d="M5.44434 9.21572L7.73917 11.5106C7.88562 11.657 8.12305 11.657 8.2695 11.5106L12.5554 7.22461"
        stroke="var(--color-white)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
