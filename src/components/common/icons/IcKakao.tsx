import { SVGProps } from 'react'
import { cn } from '@/src/utils/cn'

export function IcKakao({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn('size-6', className)}
      {...rest}
    >
      <g transform="scale(1.5625)">
        <path
          fill="#000000"
          d="M7.665 1.44q1.973 0 3.65 0.768t2.651 2.089T14.94 7.178t-0.974 2.885q-0.974 1.325 -2.647 2.093 -1.673 0.768 -3.654 0.768 -0.625 0 -1.291 -0.089 -2.89 2.007 -3.077 2.032 -0.089 0.033 -0.171 -0.008 -0.032 -0.024 -0.049 -0.065 -0.016 -0.041 -0.016 -0.073v-0.032q0.049 -0.317 0.739 -2.641 -1.567 -0.78 -2.489 -2.068Q0.39 8.689 0.39 7.178q0 -1.56 0.974 -2.881Q2.339 2.976 4.015 2.208T7.665 1.44"
        />
      </g>
    </svg>
  )
}
