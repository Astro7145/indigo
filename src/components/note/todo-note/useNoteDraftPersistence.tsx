import type { JSONContent } from '@tiptap/core';
import { useEffect, useRef } from 'react';

import NoteDraftPrompt from '@/src/components/note/todo-note/NoteDraftPrompt';
import { useToast } from '@/src/hooks/useToast';
import { useModalStore } from '@/src/stores/modal';

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
  /** 저장된 초안 삭제 (등록·수정 성공 시) */
  clear: () => void;
}

// NoteWorkspace의 임시저장·불러오기(localStorage) 책임을 전담한다.
// 폼 초안 상태(useNoteDraft)·등록/수정(useNoteSubmit)과 분리해 셸을 가볍게 유지한다.
// 편집 진입 시 저장된 초안이 있으면 불러오기 프롬프트를 모달 스택에 띄운다.
export function useNoteDraftPersistence({
  todoId,
  editing,
  applyDraft,
}: UseNoteDraftPersistenceParams): NoteDraftPersistence {
  const { showToast } = useToast();

  // applyDraft는 매 렌더 새로 생성되므로 ref에 담아 effect deps churn·stale closure를 피한다.
  const applyDraftRef = useRef(applyDraft);
  useEffect(() => {
    applyDraftRef.current = applyDraft;
  });

  // 편집 진입당 1회만 프롬프트를 띄운다(StrictMode 이중 effect에도 안전). editing이 false가 되면 리셋한다.
  const promptedRef = useRef(false);
  useEffect(() => {
    if (!editing) {
      promptedRef.current = false;
      return;
    }
    if (promptedRef.current) return;
    promptedRef.current = true;

    const stored = loadDraft(todoId);
    if (!stored) return;

    useModalStore.getState().open(
      (controls) => (
        <NoteDraftPrompt
          onDismiss={controls.close}
          onConfirm={() => {
            applyDraftRef.current(stored);
            controls.close();
          }}
        />
      ),
      { variant: 'modal', className: 'h-[178px] sm:h-[250px]' },
    );
  }, [editing, todoId]);

  return {
    save: ({ title, content }) => {
      saveDraft(todoId, { title, content });
      showToast('임시 저장되었어요.', 'success');
    },
    clear: () => clearDraft(todoId),
  };
}
