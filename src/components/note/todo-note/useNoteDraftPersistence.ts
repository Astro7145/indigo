import type { JSONContent } from '@tiptap/core';
import { useState } from 'react';

import { useToast } from '@/src/hooks/useToast';

import { loadDraft, saveDraft, clearDraft, type StoredNoteDraft } from './noteDraftStorage';

export interface UseNoteDraftPersistenceParams {
  todoId: number;
  /** 편집(작성·수정) 모드 여부. read 모드에선 초안 로직을 돌리지 않는다. */
  editing: boolean;
  /** 불러오기 확인 시 저장된 초안을 폼에 반영하는 콜백 */
  applyDraft: (draft: StoredNoteDraft) => void;
}

export interface NoteDraftPersistence {
  /** 현재 제목·본문을 localStorage에 임시저장하고 성공 토스트를 띄운다 */
  save: (draft: { title: string; content: JSONContent }) => void;
  /** 진입 시 저장된 초안이 있어 불러오기 여부를 묻는 중인지 */
  promptOpen: boolean;
  /** 불러오기 확인 — 저장된 초안을 적용하고 프롬프트를 닫는다 */
  confirmLoad: () => void;
  /** 불러오기 닫기 — 초안은 그대로 두고 프롬프트만 닫는다 */
  dismissPrompt: () => void;
  /** 저장된 초안 삭제 (등록·수정 성공 시) */
  clear: () => void;
}

// NoteWorkspace의 임시저장·불러오기(localStorage) 책임을 전담한다.
// 폼 초안 상태(useNoteDraft)·등록/수정(useNoteSubmit)과 분리해 셸을 가볍게 유지한다.
export function useNoteDraftPersistence({
  todoId,
  editing,
  applyDraft,
}: UseNoteDraftPersistenceParams): NoteDraftPersistence {
  const { showToast } = useToast();
  const [pending, setPending] = useState<StoredNoteDraft | null>(null);

  // 편집 진입(작성 모드 마운트 또는 읽기→수정) 순간 저장된 초안이 있으면 프롬프트를 띄운다.
  // 이펙트 대신 직전 editing과 렌더 중 비교해 진입당 1회만 반영한다 (React 권장: 직전 상태 기반 조정).
  // 초기값 false라 작성 모드 첫 렌더(editing=true)에서도 한 번 발화한다.
  const [prevEditing, setPrevEditing] = useState(false);
  if (editing !== prevEditing) {
    setPrevEditing(editing);
    if (editing) setPending(loadDraft(todoId));
  }

  return {
    save: ({ title, content }) => {
      saveDraft(todoId, { title, content });
      showToast('임시 저장되었어요.', 'success');
    },
    promptOpen: pending !== null,
    confirmLoad: () => {
      if (pending) applyDraft(pending);
      setPending(null);
    },
    dismissPrompt: () => setPending(null),
    clear: () => clearDraft(todoId),
  };
}
