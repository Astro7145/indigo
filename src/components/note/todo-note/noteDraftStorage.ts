import type { JSONContent } from '@tiptap/core';

export interface StoredNoteDraft {
  title: string;
  content: JSONContent;
  linkUrl?: string | null;
  /** 마지막 임시저장 시각(ISO) */
  savedAt: string;
}

// 할일당 하나의 노트 초안을 localStorage에 보관한다 (todo:note는 1:1).
export function noteDraftKey(todoId: number): string {
  return `draft:note:todo-${todoId}`;
}

// SSR(서버 렌더)·localStorage 미지원 환경에서 호출돼도 터지지 않게 가드한다.
function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

export function saveDraft(
  todoId: number,
  draft: { title: string; content: JSONContent; linkUrl?: string | null },
): void {
  const storage = getStorage();
  if (!storage) return;
  const stored: StoredNoteDraft = { ...draft, savedAt: new Date().toISOString() };
  storage.setItem(noteDraftKey(todoId), JSON.stringify(stored));
}

export function loadDraft(todoId: number): StoredNoteDraft | null {
  const storage = getStorage();
  if (!storage) return null;
  const raw = storage.getItem(noteDraftKey(todoId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredNoteDraft;
  } catch {
    // 저장값이 손상된 경우 초안 없음으로 간주
    return null;
  }
}

export function clearDraft(todoId: number): void {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(noteDraftKey(todoId));
}
