import { SVGProps } from 'react'
import { cn } from '@/src/utils/cn'

interface IcTextUnderlineProps extends SVGProps<SVGSVGElement> {
  state?: 'default' | 'active'
}

export function IcTextUnderline({
  state = 'default',
  className,
  ...rest
}: IcTextUnderlineProps) {
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
        d="M21.0002 9.33301V15.1663C21.0002 17.9278 18.7616 20.1663 16.0002 20.1663C13.2387 20.1663 11.0002 17.9278 11.0002 15.1663V9.33301M9.3335 23.4997H22.6668"
        stroke="currentColor"
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
