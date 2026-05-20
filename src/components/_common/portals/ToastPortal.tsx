'use client'

import { ReactNode, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'

interface ToastPortalProps {
  children: ReactNode
}

export default function ToastPortal({ children }: ToastPortalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const element = document.getElementById('toast-portal')

  return element && children ? ReactDOM.createPortal(children, element) : null
}
