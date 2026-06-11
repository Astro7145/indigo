'use client';

import type { JSONContent } from '@tiptap/core';
import { useRef, useState } from 'react';

import Button from '@/src/components/common/buttons/Button';
import { IcSpringNote } from '@/src/components/common/icons/IcSpringNote';
import Modal from '@/src/components/common/modal/Modal';
import NoteMetaInfo from '@/src/components/note/NoteMetaInfo';
import NoteContentEditor, { type NoteContentEditorHandle } from '@/src/components/note/todo-note/NoteContentEditor';
import { useNoteDraft } from '@/src/components/note/todo-note/useNoteDraft';
import { useNoteSubmit } from '@/src/components/note/todo-note/useNoteSubmit';
import type { Note } from '@/src/types/note';
import type { Todo } from '@/src/types/todo';

/** create=신규 작성, edit=기존 노트 수정, read=상세(읽기) */
export type NoteWorkspaceMode = 'create' | 'edit' | 'read';

export interface NoteWorkspaceProps {
  todoId: number;
  /** create 모드에선 없고, edit·read 모드에선 대상 노트 */
  note?: Note;
  /** 메타(목표·할일·태그)용 full todo. 로딩 중엔 없을 수 있어 note.todo로 폴백한다. */
  todo?: Todo;
  /** 작성/수정/상세를 가르는 단일 모드 */
  mode: NoteWorkspaceMode;
  /** 상세에서 "수정" 클릭 */
  onEdit: () => void;
  /** 등록/수정 성공 시 호출 */
  onComplete: () => void;
  /** 취소 확정 시 호출 */
  onCancel: () => void;
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
// editing만 토글하면 같은 NoteContentEditor 인스턴스를 유지한 채 전환되므로,
// 툴바가 자연스럽게 펼쳐지고(예약 공간 불필요) 에디터 재마운트로 인한 깜빡임도 없다.
export default function NoteWorkspace({ todoId, note, todo, mode, onEdit, onComplete, onCancel }: NoteWorkspaceProps) {
  // 모든 분기는 mode 한 곳에서 파생한다 — read만 읽기, 나머지는 편집. create만 신규 생성.
  const editing = mode !== 'read';
  const isCreate = mode === 'create';

  // 폼 초안(제목·본문)·dirty·valid 판별은 useNoteDraft가 전담한다.
  const { title, content, setTitle, setContent, isDirty, isValid } = useNoteDraft(note, editing);
  // 등록/수정 분기·실패 토스트는 useNoteSubmit가 전담한다.
  const { submit, isSubmitting } = useNoteSubmit({ todoId, note, mode, onComplete });
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const editorRef = useRef<NoteContentEditorHandle>(null);

  const handleCancel = () => {
    if (isDirty) {
      setIsCancelModalOpen(true);
      return;
    }
    onCancel();
  };

  const handleSubmit = () => {
    if (!isValid) return;
    submit({ title, content });
  };

  const headingText = isCreate ? '노트 작성하기' : '노트 수정하기';
  const submitText = isCreate ? '등록하기' : '수정하기';
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
    <div className="mx-auto flex min-h-full w-full max-w-[343px] flex-col sm:max-w-[636px] xl:max-w-[768px]">
      <header className="mb-4 flex h-10 items-center justify-end gap-3 sm:mb-3 sm:justify-between">
        <h1
          className={`truncate text-base font-semibold tracking-[-0.03em] text-slate-800 sm:text-2xl ${editing ? 'hidden sm:block' : 'hidden'}`}
        >
          {headingText}
        </h1>
        {editing ? (
          <div className="flex shrink-0 gap-2">
            <Button
              variant="tertiary"
              size="small"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="sm:h-10 sm:w-[106px] sm:px-0 sm:py-0 sm:text-base"
            >
              취소
            </Button>
            <Button
              variant="primary"
              size="small"
              disabled={!isValid || isSubmitting}
              onClick={handleSubmit}
              className="sm:h-10 sm:w-[106px] sm:px-0 sm:py-0 sm:text-base"
            >
              {submitText}
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            size="small"
            onClick={onEdit}
            className="shrink-0 sm:h-10 sm:w-[106px] sm:px-0 sm:py-0 sm:text-base"
          >
            수정
          </Button>
        )}
      </header>

      <div
        onClick={(e) => {
          if (!editing) return;
          if ((e.target as HTMLElement).closest('button, input, a, [contenteditable="true"]')) return;
          editorRef.current?.focus();
        }}
        className="flex flex-1 flex-col rounded-lg bg-white px-4 py-4 sm:px-[30px] sm:py-8 xl:px-[34px]"
      >
        <NoteContentEditor
          ref={editorRef}
          value={content}
          onChange={setContent}
          editable={editing}
          placeholder={editing ? '이 곳을 통해 노트 작성을 시작해주세요' : undefined}
          contentClassName="prose max-w-none min-h-[400px] pt-4 text-sm text-slate-800 sm:min-h-[450px] sm:pt-5 sm:text-base xl:min-h-[480px] [&_.ProseMirror]:outline-none [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-slate-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
          titleSlot={
            <div className="pt-[29px]">
              <div className="flex items-center gap-2 pb-3 sm:gap-3 sm:pb-4">
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
              <div className="border-b border-slate-200" />
            </div>
          }
          attachmentSlot={
            <>
              <div className="pt-3 sm:pt-4">
                <NoteMetaInfo
                  goalTitle={goalTitle}
                  todoTitle={todoTitle}
                  todoDone={todoDone}
                  tags={tags}
                  createdAt={createdAt}
                />
              </div>
              <div className="border-b border-slate-200 pt-3 sm:pt-4" />
            </>
          }
        />

        <div className="mt-auto pt-4 text-right text-xs text-slate-400 sm:text-sm">
          공백포함 {contentCharCount}자 | 공백제외 {contentNoSpaceCount}자
        </div>
      </div>

      <Modal open={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} className="h-[178px] sm:h-[250px]">
        <Modal.Title className="text-center text-base sm:text-xl">
          {isCreate ? '노트 작성을 취소하시겠어요?' : '노트 수정을 취소하시겠어요?'}
        </Modal.Title>
        <p className="mt-1 mb-6 flex items-center justify-center gap-1 text-xs font-medium text-red-500 sm:mb-10 sm:text-base">
          <span
            aria-hidden
            className="inline-flex size-4 items-center justify-center rounded-full border border-red-500 text-[10px] sm:size-5 sm:text-xs"
          >
            !
          </span>
          작성하신 모든 내용이 사라집니다.
        </p>
        <Modal.Actions>
          <Modal.Cancel className="h-10 w-[151.5px] sm:h-14 sm:w-[190px]">취소</Modal.Cancel>
          <Modal.Confirm className="h-10 w-[151.5px] sm:h-14 sm:w-[190px]" onClick={onCancel}>
            확인
          </Modal.Confirm>
        </Modal.Actions>
      </Modal>
    </div>
  );
}
