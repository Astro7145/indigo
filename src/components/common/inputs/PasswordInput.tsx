'use client'

import { cva } from 'class-variance-authority'
import Input from './Input'
import { cn } from '@/src/utils/cn'
import EyeButton from './inputButtons/EyeButton'
import { useState } from 'react'

const emailInputVariants = cva('')

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error' | 'typing'
}

export default function PasswordInput({ ...props }: PasswordInputProps) {
  const [hide, setHide] = useState(true)

  return (
    <Input
      type={hide ? 'password' : 'text'}
      className={cn(emailInputVariants())}
      iconRight={
        <EyeButton hide={hide} onClick={() => setHide((prev) => !prev)} />
      }
      {...props}
    />
  )
}
