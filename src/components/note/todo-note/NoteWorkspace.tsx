'use client';

import type { JSONContent } from '@tiptap/core';
import { useImperativeHandle, useRef, type Ref } from 'react';

import { IcSpringNote } from '@/src/components/common/icons/IcSpringNote';
import NoteMetaInfo from '@/src/components/note/NoteMetaInfo';
import NoteContentEditor, { type NoteContentEditorHandle } from '@/src/components/note/todo-note/NoteContentEditor';
import { useNoteCloseGuard } from '@/src/components/note/todo-note/useNoteCloseGuard';
import { useNoteDraft } from '@/src/components/note/todo-note/useNoteDraft';
import { useNoteDraftPersistence } from '@/src/components/note/todo-note/useNoteDraftPersistence';
import { useNoteSubmit } from '@/src/components/note/todo-note/useNoteSubmit';
import NoteWorkspaceHeader from '@/src/components/note/todo-note/NoteWorkspaceHeader';
import type { Note } from '@/src/types/note';
import type { Todo } from '@/src/types/todo';

/** create=신규 작성, edit=기존 노트 수정, read=상세(읽기) */
export type NoteWorkspaceMode = 'create' | 'edit' | 'read';

export interface NoteWorkspaceHandle {
  /** ESC 등 외부 닫기 트리거가 호출. dirty면 확인 모달, 아니면 즉시 이탈. */
  requestClose: () => void;
}

export interface NoteWorkspaceProps {
  todoId: number;
  note?: Note;
  todo?: Todo;
  /** 작성/수정/상세를 가르는 단일 모드 */
  mode: NoteWorkspaceMode;
  /** 상세에서 "수정" 클릭 */
  onEdit: () => void;
  /** 등록/수정 성공 시 호출 */
  onComplete: () => void;
  /** 취소 확정 시 호출 */
  onCancel: () => void;
  /** 상세(read) 모드에서 드로어를 닫을 때 호출 */
  onClose?: () => void;
  ref?: Ref<NoteWorkspaceHandle>;
}

function countText(node: JSONContent, acc = { total: 0, nonSpace: 0 }): { total: number; nonSpace: number } {
  if (node.type === 'text' && node.text) {
    acc.total += node.text.length;
    acc.nonSpace += node.text.replace(/\s/g, '').length;
  }
  node.content?.forEach((child) => countText(child, acc));
  return acc;
}

// 상세(NoteView)와 작성/수정(NoteWriteForm)을 하나의 셸로 통합한 컴포넌트.
export default function NoteWorkspace({
  todoId,
  note,
  todo,
  mode,
  onEdit,
  onComplete,
  onCancel,
  onClose,
  ref,
}: NoteWorkspaceProps) {
  const editing = mode !== 'read';
  const isCreate = mode === 'create';

  // 폼 초안(제목·본문)·dirty·valid 판별은 useNoteDraft가 전담한다.
  const { title, content, setTitle, setContent, isDirty, isValid } = useNoteDraft(note, editing);
  // 임시저장·불러오기(localStorage)는 useNoteDraftPersistence가 전담한다.
  const draft = useNoteDraftPersistence({
    todoId,
    editing,
    applyDraft: (stored) => {
      setTitle(stored.title);
      setContent(stored.content);
    },
  });
  // 등록/수정 분기·실패 토스트는 useNoteSubmit가 전담한다. 성공 시 보관된 초안을 비운다.
  const { submit, isSubmitting } = useNoteSubmit({
    todoId,
    note,
    mode,
    onComplete: () => {
      draft.clear();
      onComplete();
    },
  });

  const editorRef = useRef<NoteContentEditorHandle>(null);

  // dirty 판단·확인 모달은 useNoteCloseGuard가 전담한다.
  // ESC 트리거는 NoteDrawer가 소유하고, requestClose를 ref로 노출해 드로어가 호출한다.
  const { requestClose } = useNoteCloseGuard({
    editing,
    isDirty,
    isCreate,
    onCancel,
    onClose: onClose ?? onCancel,
  });

  useImperativeHandle(ref, () => ({ requestClose }), [requestClose]);

  const handleSubmit = () => {
    if (!isValid) return;
    submit({ title, content });
  };

  const { total: contentCharCount, nonSpace: contentNoSpaceCount } = countText(content);

  // full todo(note.todo embedded ref는 tags 미포함)를 우선 쓰되, 로딩 중엔 note.todo로 폴백해
  // 목표·할일은 즉시 보여준다 (tags는 full todo 도착 후 표시).
  const metaTodo = todo ?? note?.todo;
  const goalTitle = metaTodo?.goal?.title ?? '';
  const todoTitle = metaTodo?.title ?? '';
  const todoDone = metaTodo?.done ?? false;
  const tags = metaTodo?.tags;
  // "작성일" 라벨에는 기획상 "마지막 저장일"(updatedAt)을 쓴다 — 상세와 정렬. 작성 모드는 아직 저장 전이라 현재 시각을 표시.
  const createdAt = note?.updatedAt ?? new Date().toISOString();

  return (
    <div className="flex min-h-full w-full flex-col">
      <NoteWorkspaceHeader
        mode={mode}
        isValid={isValid}
        isSubmitting={isSubmitting}
        onCancel={requestClose}
        onSaveDraft={() => draft.save({ title, content })}
        onSubmit={handleSubmit}
        onEdit={onEdit}
        onClose={onClose}
      />

      <div
        onClick={(e) => {
          if (!editing) return;
          if ((e.target as HTMLElement).closest('button, input, a, [contenteditable="true"]')) return;
          editorRef.current?.focus();
        }}
        className="flex flex-1 flex-col rounded-[4px] border border-slate-200 bg-white px-4 py-4 shadow-[0_2px_4px_0_rgba(0,0,0,0.04)] sm:px-[30px] sm:py-8 xl:px-[34px]"
      >
        <NoteContentEditor
          ref={editorRef}
          value={content}
          onChange={setContent}
          editable={editing}
          placeholder={editing ? '이 곳을 통해 노트 작성을 시작해주세요' : undefined}
          contentClassName="prose max-w-none min-h-[400px] pt-5 text-sm text-slate-800 sm:min-h-[450px] sm:text-base xl:min-h-[480px] [&_.ProseMirror]:outline-none [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-slate-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
          titleSlot={
            <div className="flex items-center gap-2 sm:gap-3">
              <IcSpringNote aria-hidden className="size-8 shrink-0 sm:size-10" />
              {editing ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={30}
                  placeholder="노트의 제목을 입력해주세요"
                  aria-label="제목"
                  className="h-8 min-w-0 flex-1 py-0 text-base font-semibold tracking-[-0.03em] text-slate-800 outline-none placeholder:text-slate-400 sm:h-10 sm:text-2xl"
                />
              ) : (
                <h2 className="flex h-8 min-w-0 flex-1 items-center truncate text-base font-semibold tracking-[-0.03em] text-slate-800 sm:h-10 sm:text-2xl">
                  {title}
                </h2>
              )}
              {editing && <span className="shrink-0 text-xs text-indigo-500 sm:text-sm">{title.length}/30</span>}
            </div>
          }
          attachmentSlot={
            <>
              <div className="pt-6 sm:pt-[30px]">
                <NoteMetaInfo
                  goalTitle={goalTitle}
                  todoTitle={todoTitle}
                  todoDone={todoDone}
                  tags={tags}
                  createdAt={createdAt}
                />
              </div>
              <div className="border-b border-slate-200 pt-4 sm:pt-6" />
            </>
          }
        />

        {editing && (
          <div className="mt-auto pt-4 text-right text-xs text-slate-400 sm:text-sm">
            공백포함 {contentCharCount}자 | 공백제외 {contentNoSpaceCount}자
          </div>
        )}
      </div>
    </div>
  );
}
