import { SVGProps } from 'react'
import { cn } from '@/src/utils/cn'

interface IcCheckProps extends SVGProps<SVGSVGElement> {
  color?: 'white' | 'indigo'
}

export function IcCheck({
  color = 'white',
  className,
  ...rest
}: IcCheckProps) {
  const variants: Record<'white' | 'indigo', string> = {
    white: 'size-4 text-white',
    indigo: 'size-4 text-indigo-600',
  }

  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={cn(variants[color], className)}
      {...rest}
    >
      <path
        d="M4.44434 8.21572L6.73917 10.5106C6.88562 10.657 7.12305 10.657 7.2695 10.5106L11.5554 6.22461"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
