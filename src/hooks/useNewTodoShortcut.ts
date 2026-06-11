'use client';

import { useEffect } from 'react';

// 입력 중(input/textarea/contenteditable)에는 단축키가 글자 입력을 가로채지 않도록 제외한다
const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
};

/**
 * 새 할일 N 단축키 — 전역 리스너라 항상 마운트되는 곳(Sidebar) 한 군데서만 호출한다.
 * 버튼 컴포넌트의 마운트 여부(접힘 등)에 단축키가 종속되지 않도록 버튼과 분리돼 있다.
 */
export function useNewTodoShortcut(onTrigger: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
      if (event.key !== 'n' && event.key !== 'N') return;
      if (isTypingTarget(event.target)) return;
      event.preventDefault();
      onTrigger();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTrigger]);
}
