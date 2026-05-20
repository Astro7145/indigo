import { SVGProps } from 'react'
import { cn } from '@/src/utils/cn'

interface IcDeleteProps extends SVGProps<SVGSVGElement> {
  state?: 'default' | 'active'
}

export function IcDelete({
  state = 'default',
  className,
  ...rest
}: IcDeleteProps) {
  const variants: Record<'default' | 'active', string> = {
    default: 'size-6 text-slate-400',
    active: 'size-6 text-white',
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn(variants[state], className)}
      {...rest}
    >
      <path
        d="M6 6.5L18 18.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M18 6.5L6 18.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}
