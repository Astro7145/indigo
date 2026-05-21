'use client'

import { SVGProps, useId } from 'react'
import { cn } from '@/src/utils/cn'

interface IcGoalProps extends SVGProps<SVGSVGElement> {
  size?: 'sm' | 'lg'
  bgShape?: 'square' | 'circle'
}

export function IcGoal({ size = 'sm', bgShape = 'square', className, ...rest }: IcGoalProps) {
  const id = useId()

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn(size === 'lg' ? 'size-[180px]' : 'size-8', className)}
      {...rest}
    >
      {bgShape === 'circle' ? (
        <circle cx="20" cy="20" r="20" fill="var(--color-indigo-300)" />
      ) : (
        <rect width="40" height="40" rx="4" fill="var(--color-indigo-300)" />
      )}
      <svg x="6.25" y="7.5" width="28" height="25" viewBox="0 0 19 20">
        <path
          d="M3.8334 8.88281C4.39154 7.84627 5.47373 7.19988 6.65098 7.19988H11.4438C12.6211 7.19988 13.7032 7.84627 14.2614 8.8828L17.7076 15.283C18.8556 17.4149 17.3115 20.0002 14.89 20.0002H3.20474C0.783316 20.0002 -0.76083 17.415 0.387165 15.283L3.8334 8.88281Z"
          fill={`url(#${id})`}
        />
        <path
          d="M12.4168 7.19988H5.67798C5.12058 7.19988 4.60335 7.48996 4.31269 7.96558L1.84721 12L4.43596 10.7971C5.07726 10.4992 5.81734 10.4992 6.45864 10.7971L8.03605 11.5301C8.67735 11.8281 9.41743 11.8281 10.0587 11.5301L11.6361 10.7971C12.2774 10.4992 13.0175 10.4992 13.6588 10.7971L16.2476 12L13.7821 7.96558C13.4914 7.48996 12.9742 7.19988 12.4168 7.19988Z"
          fill="var(--color-white)"
        />
        <line
          x1="8.24747" y1="2.39996" x2="8.24747" y2="7.20008"
          stroke="var(--color-indigo-600)"
          strokeWidth="1.6"
        />
        <path
          d="M7.44745 0.800019C7.44745 0.358181 7.80563 0 8.24747 0H14.5936C14.9327 0 15.118 0.395553 14.9009 0.65609L13.8744 1.8879C13.6272 2.18458 13.6272 2.61553 13.8744 2.91222L14.9009 4.14403C15.118 4.40456 14.9327 4.80012 14.5936 4.80012H8.24747C7.80563 4.80012 7.44745 4.44194 7.44745 4.0001V0.800019Z"
          fill="var(--color-indigo-600)"
        />
      </svg>
      <defs>
        <linearGradient id={id} x1="9.04739" y1="7.19988" x2="9.04739" y2="20.0002" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--color-indigo-600)" />
          <stop offset="1" stopColor="var(--color-indigo-500)" />
        </linearGradient>
      </defs>
    </svg>
  )
}
