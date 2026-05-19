import { SVGProps } from 'react'
import { cn } from '@/src/utils/cn'

interface IcNoteProps extends SVGProps<SVGSVGElement> {
  state?: 'default' | 'active'
}

export function IcNote({ state = 'default', className, ...rest }: IcNoteProps) {
  if (state === 'default') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={cn('size-6', className)}
        {...rest}
      >
        <circle
          cx="12"
          cy="12"
          r="12"
          fill="var(--color-white)"
          fillOpacity="0.4"
        />
        <rect
          x="7.5"
          y="6.90039"
          width="9"
          height="10.3846"
          rx="1.38462"
          fill="var(--color-indigo-700)"
        />
        <path
          d="M9.57715 10.0156H14.4233"
          stroke="var(--color-indigo-200)"
          strokeWidth="0.969231"
          strokeLinecap="round"
        />
        <path
          d="M9.57666 12.0928H14.4228"
          stroke="var(--color-indigo-200)"
          strokeWidth="0.969231"
          strokeLinecap="round"
        />
        <path
          d="M9.57666 14.1699H14.4228"
          stroke="var(--color-indigo-200)"
          strokeWidth="0.969231"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn('size-6', className)}
      {...rest}
    >
      <circle
        cx="12"
        cy="12"
        r="12"
        fill="var(--color-indigo-700)"
        fillOpacity="0.2"
      />
      <rect
        x="7.5"
        y="6.90039"
        width="9"
        height="10.3846"
        rx="1.38462"
        fill="var(--color-indigo-700)"
      />
      <path
        d="M9.57715 10.0156H14.4233"
        stroke="var(--color-indigo-200)"
        strokeWidth="0.969231"
        strokeLinecap="round"
      />
      <path
        d="M9.57666 12.0928H14.4228"
        stroke="var(--color-indigo-200)"
        strokeWidth="0.969231"
        strokeLinecap="round"
      />
      <path
        d="M9.57666 14.1699H14.4228"
        stroke="var(--color-indigo-200)"
        strokeWidth="0.969231"
        strokeLinecap="round"
      />
    </svg>
  )
}
