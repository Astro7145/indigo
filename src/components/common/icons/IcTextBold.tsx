import { SVGProps } from 'react'
import { cn } from '@/src/utils/cn'

interface IcTextBoldProps extends SVGProps<SVGSVGElement> {
  state?: 'default' | 'active'
}

export function IcTextBold({
  state = 'default',
  className,
  ...rest
}: IcTextBoldProps) {
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
        d="M11 15.9997H17.6667C19.5076 15.9997 21 14.5073 21 12.6663C21 10.8254 19.5076 9.33301 17.6667 9.33301H11V15.9997ZM11 15.9997H18.5C20.3409 15.9997 21.8333 17.4921 21.8333 19.333C21.8333 21.174 20.3409 22.6663 18.5 22.6663H11V15.9997Z"
        stroke="currentColor"
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
