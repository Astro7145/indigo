import { create } from 'zustand';

interface SettingsModalState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

// 설정 모달의 열림/닫힘만 담당하는 전역 UI 상태.
// (언어·다크모드 값은 #141 범위 밖이라 각 컴포넌트의 로컬 상태로 두고, 실제 적용은 후속 이슈 #143·#144에서 처리)
export const useSettingsModalStore = create<SettingsModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
