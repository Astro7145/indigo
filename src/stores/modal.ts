import type { ReactNode } from 'react';
import { create } from 'zustand';

// 콘텐츠 스택 모달. isOpen 불리언 없이 배열이 곧 상태이며, 마지막 원소가 top(LIFO)이다.
// ESC·z-index·scroll lock·variant 해석 등 전역 책임은 <ModalStack/>이 이 스택을 읽어 처리한다.
//
// 식별자(id) 없이 위치=정체성으로 다룬다. 모든 닫기는 항상 최상단을 향하므로(위에 모달이 있으면
// 아래는 상호작용 불가) close는 맨 위 하나를, closeWithParent는 위 두 개(자기+바로 아래 부모)를
// 함께 제거한다. 확인 다이얼로그는 늘 부모 폼 바로 위에 쌓이고 중간에 끼어드는 모달이 없다는 전제다.

export type ModalVariant = 'bottom-sheet' | 'modal' | 'auto';

export interface ModalControls {
  close: () => void;
  /** 자기 자신과 바로 아래 부모 엔트리를 함께 닫는다(위 2개). */
  closeWithParent: () => void;
}

export interface ModalEntry {
  /** AnimatePresence가 exit 애니메이션 동안 엔트리를 안정적으로 추적하기 위한 키. */
  id: string;
  variant: ModalVariant;
  render: (controls: ModalControls) => ReactNode;
  /**
   * ESC·백드롭 클릭으로 닫기를 시도할 때 호출. 미지정 시 close()(맨 위 닫기)로 동작한다.
   * 작성 중 폼처럼 곧장 닫지 않고 이탈 확인을 띄워야 할 때 override 한다. (항상 무언가에는 반응)
   */
  onClose?: () => void;
  /** modal variant의 셸(Modal)에 전달할 추가 클래스 — 기본 너비/패딩을 덮어쓸 때 쓴다. */
  className?: string;
}

export interface ModalOptions {
  variant?: ModalVariant;
  onClose?: () => void;
  className?: string;
}

interface ModalState {
  modals: ModalEntry[];
  open: (render: (controls: ModalControls) => ReactNode, options?: ModalOptions) => void;
  close: () => void;
  closeWithParent: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  modals: [],
  open: (render, options) => {
    const entry: ModalEntry = {
      id: crypto.randomUUID(),
      render,
      variant: options?.variant ?? 'auto',
      onClose: options?.onClose,
      className: options?.className,
    };
    set((state) => ({ modals: [...state.modals, entry] }));
  },
  close: () => set((state) => ({ modals: state.modals.slice(0, -1) })),
  closeWithParent: () => set((state) => ({ modals: state.modals.slice(0, -2) })),
}));
