import { create } from 'zustand'

interface ToastState {
  isOpen: boolean
  message: string
  show: (message: string) => void
  hide: () => void
}

// 컴포넌트 외부(훅·유틸)에서도 토스트를 제어할 수 있도록 전역 스토어로 관리
export const useToastStore = create<ToastState>((set) => ({
  isOpen: false,
  message: '',
  show: (message) => set({ isOpen: true, message }),
  hide: () => set({ isOpen: false }),
}))
