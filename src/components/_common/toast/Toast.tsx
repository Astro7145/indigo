'use client'

import { useToastStore } from '@/src/stores/toast'

import ToastPortal from '../portals/ToastPortal'

export default function Toast() {
  const { isOpen, message } = useToastStore()

  if (!isOpen) return null

  return (
    <ToastPortal>
      <div className="flex items-center gap-x-1 rounded-sm bg-indigo-200 px-4 py-2">
        <span>✅</span>
        <span className="text-sm font-semibold">{message}</span>
      </div>
    </ToastPortal>
  )
}
