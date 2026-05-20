import { useId, SVGProps } from 'react'
import { cn } from '@/src/utils/cn'

interface LogoProps extends SVGProps<SVGSVGElement> {
  size?: 'sm' | 'md' | 'lg'
}

const sizes: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'size-6',
  md: 'size-12',
  lg: 'size-24',
}

export function Logo({ size = 'md', className, ...rest }: LogoProps) {
  const id = useId()
  const g1 = `${id}-g1`
  const g2 = `${id}-g2`

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn(sizes[size], className)}
      {...rest}
    >
      <path
        opacity="0.95"
        d="M18 7C18.8284 7 19.5 6.32843 19.5 5.5C19.5 4.67157 18.8284 4 18 4C17.1716 4 16.5 4.67157 16.5 5.5C16.5 6.32843 17.1716 7 18 7Z"
        fill="white"
      />
      <g opacity="0.85">
        <path
          d="M1.84619 21.2308L12 3.69238L22.1539 21.2308H1.84619Z"
          fill={`url(#${g1})`}
        />
        <path
          d="M14.3474 7.74649L13.0002 8.66951L12 7.64233L10.9999 8.66951L9.65223 7.74649L12 3.69238L14.3474 7.74649Z"
          fill="white"
        />
      </g>
      <g opacity="0.85">
        <path
          d="M1.84619 21.2311L6.92311 12.4619L12 21.2311H1.84619Z"
          fill={`url(#${g2})`}
        />
        <path
          d="M8.09679 14.489L7.42319 14.9505L6.92311 14.4369L6.42304 14.9505L5.74921 14.489L6.92311 12.4619L8.09679 14.489Z"
          fill="white"
        />
      </g>
      <defs>
        <linearGradient
          id={g1}
          x1="12"
          y1="3.69238"
          x2="12"
          y2="21.2308"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E7DDFF" />
          <stop offset="1" stopColor="#464590" />
        </linearGradient>
        <linearGradient
          id={g2}
          x1="6.92311"
          y1="12.4619"
          x2="6.92311"
          y2="21.2311"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#B3AAFF" />
          <stop offset="1" stopColor="#464590" />
        </linearGradient>
      </defs>
    </svg>
  )
}
