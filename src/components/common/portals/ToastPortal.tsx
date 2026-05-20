'use client'

import { ReactNode } from 'react'
import ReactDOM from 'react-dom'

interface ToastPortalProps {
  children: ReactNode
}

export default function ToastPortal({ children }: ToastPortalProps) {
  const element =
    typeof window !== 'undefined' && document.querySelector(`#toast-portal`)
  return element && children ? ReactDOM.createPortal(children, element) : null
}
