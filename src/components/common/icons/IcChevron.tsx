import { SVGProps } from 'react'
import { cn } from '@/src/utils/cn'

interface IcChevronProps extends SVGProps<SVGSVGElement> {
  direction?: 'left' | 'right' | 'up' | 'down'
}

export function IcChevron({
  direction = 'left',
  className,
  ...rest
}: IcChevronProps) {
  const rotate: Record<'left' | 'right' | 'up' | 'down', string> = {
    left: '',
    right: 'rotate-180',
    up: '-rotate-90',
    down: 'rotate-90',
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn('size-6 text-slate-400', rotate[direction], className)}
      {...rest}
    >
      <path
        d="M15 18L9 12L15 6"
        stroke="currentColor"
        strokeWidth="2.004"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
