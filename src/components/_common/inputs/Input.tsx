'use client'

import { cn } from '@/src/utils/cn'
import { cva } from 'class-variance-authority'
import { useRef } from 'react'

const inputContainerVariants = cva(
  'flex items-center gap-x-2 rounded-sm border bg-white has-focus:border-indigo-500 cursor-text p-3 sm:p-4',
  {
    variants: {
      variant: {
        default: 'border-slate-300',
        error: 'border-destructive',
        typing: 'border-indigo-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
  variant?: 'default' | 'error' | 'typing'
  iconRight?: React.ReactNode
}

export default function Input({
  className,
  variant,
  iconRight,
  ...props
}: InputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <span
      className={cn(inputContainerVariants({ variant }), className)}
      onClick={() => inputRef.current?.focus()}
    >
      <input
        ref={inputRef}
        type="text"
        className="text-sm font-normal text-slate-700 outline-none placeholder:text-sm placeholder:font-normal placeholder:text-slate-500 sm:text-base sm:placeholder:text-base"
        {...props}
      />
      {iconRight}
    </span>
  )
}
