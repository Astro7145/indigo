import { SVGProps } from 'react'
import { cn } from '@/src/utils/cn'

interface IcTextAlignCenterProps extends SVGProps<SVGSVGElement> {
  state?: 'default' | 'active'
}

export function IcTextAlignCenter({
  state = 'default',
  className,
  ...rest
}: IcTextAlignCenterProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn(
        'size-8',
        state === 'default' ? 'text-slate-500' : 'text-slate-700',
        className,
      )}
      {...rest}
    >
      {state === 'active' && (
        <rect width="32" height="32" rx="8" fill="var(--color-slate-200)" />
      )}
      <path
        d="M21 14.3333H11M23.5 11H8.5M23.5 17.6667H8.5M21 21H11"
        stroke="currentColor"
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
