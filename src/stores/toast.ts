import { create } from 'zustand';

export type ToastVariant = 'success' | 'error';

interface ToastState {
  isOpen: boolean;
  message: string;
  variant: ToastVariant;
  show: (message: string, variant?: ToastVariant) => void;
  hide: () => void;
}

// 컴포넌트 외부(훅·유틸)에서도 토스트를 제어할 수 있도록 전역 스토어로 관리
export const useToastStore = create<ToastState>((set) => ({
  isOpen: false,
  message: '',
  variant: 'success',
  show: (message, variant = 'success') => set({ isOpen: true, message, variant }),
  hide: () => set({ isOpen: false }),
}));
