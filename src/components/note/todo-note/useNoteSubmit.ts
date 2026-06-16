import type { JSONContent } from '@tiptap/core';

import { useCreateNote, useUpdateNote } from '@/src/hooks/note';
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
  /** 제목·본문을 받아 모드에 맞는 mutation을 호출하고, 성공 시 onComplete를 부른다 */
  submit: (draft: { title: string; content: JSONContent }) => void;
  /** 생성·수정 중 하나라도 진행 중인지 */
  isSubmitting: boolean;
}

// NoteWorkspace의 등록/수정 분기와 실패 토스트를 전담한다.
// edit이면 PATCH(기존 링크 보존), 그 외엔 신규 생성. mutation 선택만 모드 의존적이고
// 나머지(셸·초안)는 NoteWorkspace/useNoteDraft가 따로 책임진다.
export function useNoteSubmit({ todoId, note, mode, onComplete }: UseNoteSubmitParams): NoteSubmit {
  const { mutate: createNote, isPending: isCreating } = useCreateNote();
  const { mutate: updateNote, isPending: isUpdating } = useUpdateNote();
  const { showToast } = useToast();

  const submit = ({ title, content }: { title: string; content: JSONContent }) => {
    if (mode === 'edit' && note) {
      // linkUrl은 이 폼에서 다루지 않는다. PATCH는 생략 시 기존 값을 유지하므로 기존 링크는 보존된다.
      updateNote(
        { noteId: note.id, body: { title, content } },
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
        { todoId, title, content },
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
