import { SVGProps } from 'react'
import { cn } from '@/src/utils/cn'

interface IcTextAlignLeftProps extends SVGProps<SVGSVGElement> {
  state?: 'default' | 'active'
}

export function IcTextAlignLeft({
  state = 'default',
  className,
  ...rest
}: IcTextAlignLeftProps) {
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
        d="M19.3333 14.3333H8.5M22.6667 11H8.5M22.6667 17.6667H8.5M19.3333 21H8.5"
        stroke="currentColor"
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
