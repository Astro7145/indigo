import type { JSONContent } from '@tiptap/core';

import { useCreateNote, useUpdateNote } from '@/src/hooks/note/note';
import { useToast } from '@/src/hooks/useToast';
import type { Note } from '@/src/types/note';

import type { NoteWorkspaceMode } from '@/src/components/note/todo-note/NoteWorkspace';

export interface UseNoteSubmitParams {
  todoId: number;
  /** edit 모드에선 대상 노트 (mode === 'edit'일 때만 사용) */
  note?: Note;
  mode: NoteWorkspaceMode;
  /** 등록/수정 성공 시 호출 */
  onComplete: () => void;
}

export interface NoteSubmit {
  /** 제목·본문·링크를 받아 모드에 맞는 mutation을 호출하고, 성공 시 onComplete를 부른다 */
  submit: (draft: { title: string; content: JSONContent; linkUrl: string | null }) => void;
  /** 생성·수정 중 하나라도 진행 중인지 */
  isSubmitting: boolean;
}

// NoteWorkspace의 등록/수정 분기와 실패 토스트를 전담한다.
// edit이면 PATCH, 그 외엔 신규 생성. mutation 선택만 모드 의존적이고
// 나머지(셸·초안)는 NoteWorkspace/useNoteDraft가 따로 책임진다.
export function useNoteSubmit({ todoId, note, mode, onComplete }: UseNoteSubmitParams): NoteSubmit {
  const { mutate: createNote, isPending: isCreating } = useCreateNote();
  const { mutate: updateNote, isPending: isUpdating } = useUpdateNote();
  const { showToast } = useToast();

  const submit = ({ title, content, linkUrl }: { title: string; content: JSONContent; linkUrl: string | null }) => {
    if (mode === 'edit' && note) {
      // PATCH는 linkUrl을 항상 포함해야 한다 — nullable이라 null 전송이 "링크 제거" 의미를 갖는다(생략 시 기존 값 유지).
      updateNote(
        { noteId: note.id, body: { title, content, linkUrl } },
        {
          onSuccess: () => {
            showToast('노트가 수정되었어요.', 'success');
            onComplete();
          },
          onError: () => {
            showToast('노트 수정에 실패했어요.', 'error');
          },
        },
      );
    } else {
      createNote(
        // CreateNoteBody.linkUrl은 non-null이라 값이 있을 때만 포함한다.
        { todoId, title, content, ...(linkUrl ? { linkUrl } : {}) },
        {
          onSuccess: () => {
            showToast('노트가 등록되었어요.', 'success');
            onComplete();
          },
          onError: () => {
            showToast('노트 등록에 실패했어요.', 'error');
          },
        },
      );
    }
  };

  return { submit, isSubmitting: isCreating || isUpdating };
}
