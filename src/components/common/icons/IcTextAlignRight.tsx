import { SVGProps } from 'react'
import { cn } from '@/src/utils/cn'

interface IcTextAlignRightProps extends SVGProps<SVGSVGElement> {
  state?: 'default' | 'active'
}

export function IcTextAlignRight({
  state = 'default',
  className,
  ...rest
}: IcTextAlignRightProps) {
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
        d="M12.6667 14.3333H23.5M9.33333 11H23.5M9.33333 17.6667H23.5M12.6667 21H23.5"
        stroke="currentColor"
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
