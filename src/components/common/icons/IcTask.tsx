'use client'

import { SVGProps, useId } from 'react'
import { cn } from '@/src/utils/cn'

interface IcTaskProps extends SVGProps<SVGSVGElement> {
  small?: boolean
}

export function IcTask({ small, className, ...rest }: IcTaskProps) {
  const id = useId()

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn(small ? 'size-8' : 'size-10', className)}
      {...rest}
    >
      <rect width="40" height="40" rx="4" fill="var(--color-indigo-400)" />
      <svg x="10" y="6.25" width="20" height="26" viewBox="0 0 16 21">
        <rect y="2.3999" width="16" height="18.4" rx="0.4" fill={`url(#${id})`} />
        <rect x="1.6001" y="4" width="12.8" height="15.2" rx="0.4" fill="var(--color-white)" />
        <rect x="4" y="2.3999" width="8" height="4" rx="0.4" fill="var(--color-indigo-700)" />
        <circle cx="8.0001" cy="2.4" r="2.4" fill="var(--color-indigo-700)" />
        <circle cx="8.0002" cy="2.4001" r="0.8" fill="var(--color-indigo-300)" />
        <rect x="4" y="11.2002" width="8" height="1.6" fill="var(--color-slate-200)" />
        <rect x="4" y="8" width="8" height="1.6" fill="var(--color-slate-200)" />
        <rect x="4" y="14.3999" width="8" height="1.6" fill="var(--color-slate-200)" />
      </svg>
      <defs>
        <linearGradient id={id} x1="8" y1="2.3999" x2="8" y2="20.7999" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--color-indigo-600)" />
          <stop offset="1" stopColor="var(--color-indigo-500)" />
        </linearGradient>
      </defs>
    </svg>
  )
}
