import type { ReactNode } from 'react';
import { create } from 'zustand';

interface TopbarSlotState {
  rightSlot: ReactNode | null;
  setRightSlot: (node: ReactNode) => void;
  clearRightSlot: () => void;
}

// 모바일 Topbar 우측 영역을 페이지가 주입 가능한 슬롯으로 관리한다.
// 페이지(주로 폼) 컴포넌트가 자신의 액션 버튼을 등록하고, unmount 시 정리한다.
export const useTopbarSlotStore = create<TopbarSlotState>((set) => ({
  rightSlot: null,
  setRightSlot: (node) => set({ rightSlot: node }),
  clearRightSlot: () => set({ rightSlot: null }),
}));
