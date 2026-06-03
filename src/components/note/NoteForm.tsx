'use client';

import type { JSONContent } from '@tiptap/core';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import Button from '@/src/components/common/buttons/Button';
import Modal from '@/src/components/common/modal/Modal';
import NoteEditor, { type NoteEditorHandle } from '@/src/components/note/NoteEditor';
import NoteEmbedPanel from '@/src/components/note/NoteEmbedPanel';
import NoteLinkCard from '@/src/components/note/NoteLinkCard';
import NoteMetaInfo from '@/src/components/note/NoteMetaInfo';
import { IcSpringNote } from '@/src/components/common/icons/IcSpringNote';
import { useCreateNote, useNoteList, useUpdateNote } from '@/src/hooks/note';
import { useTodo } from '@/src/hooks/todo';

export type NoteFormProps = { mode: 'create'; todoId: number } | { mode: 'edit'; todoId: number };

const EMPTY_DOC: JSONContent = { type: 'doc', content: [] };

// Tiptap JSON 트리에 실제 text node가 있는지로 "비어있음"을 판별 (PostForm의 isHtmlEmpty에 대응)
function hasText(node: JSONContent): boolean {
  if (node.type === 'text' && node.text?.trim()) return true;
  return node.content?.some(hasText) ?? false;
}

// Tiptap JSON은 round-trip 안정적이라 stringify 비교로 dirty 판별 충분
function isSameJSON(a: JSONContent, b: JSONContent): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function countText(node: JSONContent, acc = { total: 0, nonSpace: 0 }): { total: number; nonSpace: number } {
  if (node.type === 'text' && node.text) {
    acc.total += node.text.length;
    acc.nonSpace += node.text.replace(/\s/g, '').length;
  }
  node.content?.forEach((child) => countText(child, acc));
  return acc;
}

export default function NoteForm(props: NoteFormProps) {
  const router = useRouter();
  // note는 todo와 1:1이라 todoId로 첫 노트를 잡아서 edit 모드의 initial 데이터로 사용한다
  const { data: noteListData } = useNoteList({ todoId: props.todoId });
  const { data: todo } = useTodo(props.todoId);
  const { mutateAsync: createNote } = useCreateNote();
  const { mutateAsync: updateNote } = useUpdateNote();

  const initialNote = props.mode === 'edit' ? noteListData?.notes[0] : undefined;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState<JSONContent>(EMPTY_DOC);
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isLinkInputOpen, setIsLinkInputOpen] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [isEmbedOpen, setIsEmbedOpen] = useState(false);
  const [isEmbedExpanded, setIsEmbedExpanded] = useState(false);
  const editorRef = useRef<NoteEditorHandle>(null);

  // 서버 데이터로 폼을 한 번만 채운다. mutation 응답이나 refetch가 사용자의 편집을 덮어쓰지 않도록 일회성 hydration 사용
  const hydrated = useRef(false);
  useEffect(() => {
    if (!initialNote || hydrated.current) return;
    setTitle(initialNote.title);
    setContent((initialNote.content as JSONContent | undefined) ?? EMPTY_DOC);
    setLinkUrl(initialNote.linkUrl);
    hydrated.current = true;
  }, [initialNote]);

  const initialTitle = initialNote?.title ?? '';
  const initialContent = (initialNote?.content as JSONContent | undefined) ?? EMPTY_DOC;
  const initialLinkUrl = initialNote?.linkUrl ?? null;
  const isDirty = title !== initialTitle || linkUrl !== initialLinkUrl || !isSameJSON(content, initialContent);
  const isValid = title.trim().length > 0 && hasText(content);

  // 수정 모드에서 데이터 도착까지 로딩 표시
  if (props.mode === 'edit' && !initialNote) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-156px)] w-full max-w-[343px] items-center justify-center rounded-lg bg-white sm:min-h-[calc(100vh-100px)] sm:max-w-[636px] xl:min-h-[calc(100vh-212px)] xl:max-w-[768px]">
        <p className="text-sm text-slate-400">불러오는 중…</p>
      </div>
    );
  }

  const handleCancel = () => {
    if (isDirty) {
      setIsCancelModalOpen(true);
      return;
    }
    router.back();
  };

  const handleLinkInsertClick = () => {
    setLinkInput(linkUrl ?? '');
    setIsLinkInputOpen(true);
  };
  const handleLinkConfirm = () => {
    const trimmed = linkInput.trim();
    if (!trimmed) return;
    setLinkUrl(trimmed);
    setIsLinkInputOpen(false);
  };
  const handleLinkDelete = () => {
    setLinkUrl(null);
    setIsEmbedOpen(false);
  };

  // TODO(@<wiring>): 임시저장 — 로컬스토리지 추천 (ProseMirror JSON 그대로 직렬화 가능). 키 예시: `draft:note:todo-${todoId}`
  const handleDraft = () => {};

  const handleSubmit = async () => {
    if (!isValid) return;
    if (props.mode === 'edit' && initialNote) {
      // PATCH는 linkUrl을 항상 포함해야 null 전송이 "링크 제거" 의미를 가짐 (Swagger: linkUrl nullable, 생략 시 유지)
      await updateNote({ noteId: initialNote.id, body: { title, content, linkUrl } });
      router.back();
      return;
    }
    await createNote({
      todoId: props.todoId,
      title,
      content,
      ...(linkUrl ? { linkUrl } : {}),
    });
    router.back();
  };

  const headingText = props.mode === 'edit' ? '노트 수정하기' : '노트 작성하기';
  const submitText = props.mode === 'edit' ? '수정하기' : '등록하기';

  const { total: contentCharCount, nonSpace: contentNoSpaceCount } = countText(content);

  const goalTitle = todo?.goal?.title ?? '';
  const todoTitle = todo?.title ?? '';
  const todoDone = todo?.done ?? false;
  const tags = todo?.tags;
  const createdAt = initialNote?.createdAt ?? new Date().toISOString();

  return (
    // 데스크탑(xl+)에서 패널이 열리면 form과 패널이 flex-row로 나란히 reflow. 모바일/태블릿(xl 미만)에선 패널이 bottom drawer로 오버레이.
    <div className={`flex flex-col ${isEmbedOpen ? 'xl:flex-row xl:items-stretch xl:gap-6' : ''}`}>
      <div
        className={`mx-auto w-full max-w-[343px] sm:max-w-[636px] ${
          isEmbedOpen ? 'xl:mx-0 xl:max-w-[768px] xl:flex-1' : 'xl:max-w-[768px]'
        }`}
      >
        <header className="mb-4 flex h-10 items-center justify-end gap-3 sm:mb-3 sm:justify-between">
          {/* 모바일은 (main) layout의 Topbar가 페이지명을 표시하므로 중복을 피해 sm 이상에서만 노출 */}
          <h1 className="hidden truncate text-base font-semibold tracking-[-0.03em] text-slate-800 sm:block sm:text-2xl">
            {headingText}
          </h1>
          <div className="flex shrink-0 gap-2">
            <Button
              variant="tertiary"
              size="small"
              onClick={handleDraft}
              disabled={!isValid}
              className="sm:h-10 sm:w-[106px] sm:px-0 sm:py-0 sm:text-base"
            >
              임시저장
            </Button>
            <Button
              variant="primary"
              size="small"
              disabled={!isValid}
              onClick={handleSubmit}
              className="sm:h-10 sm:w-[106px] sm:px-0 sm:py-0 sm:text-base"
            >
              {submitText}
            </Button>
          </div>
        </header>

        <div
          // 카드 내 빈 영역을 눌러도 커서가 에디터로 들어가게 함. 인터랙티브 요소는 자기 동작 유지
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('button, input, a, [contenteditable="true"]')) return;
            editorRef.current?.focus();
          }}
          className="flex min-h-[calc(100vh-156px)] flex-col rounded-lg bg-white px-4 py-4 sm:min-h-[calc(100vh-100px)] sm:px-[30px] sm:py-8 xl:min-h-[calc(100vh-212px)] xl:px-[34px]"
        >
          <NoteEditor
            ref={editorRef}
            value={content}
            onChange={setContent}
            onLinkInsertClick={handleLinkInsertClick}
            placeholder="이 곳을 통해 노트 작성을 시작해주세요"
            // Tiptap 내부 .ProseMirror DOM 겨냥: 포커스 outline 제거, tailwind가 지운 ul/ol 마커 복원, Placeholder extension이 박아둔 data-placeholder를 ::before로 실제 표시
            contentClassName="prose max-w-none min-h-[400px] pt-4 text-sm text-slate-800 sm:min-h-[450px] sm:pt-5 sm:text-base xl:min-h-[480px] [&_.ProseMirror]:outline-none [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-slate-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
            titleSlot={
              <div className="pt-[29px]">
                <div className="flex items-center gap-2 pb-3 sm:gap-3 sm:pb-4">
                  <IcSpringNote className="size-8 shrink-0 sm:size-10" />
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={30}
                    placeholder="노트의 제목을 입력해주세요"
                    aria-label="제목"
                    className="min-w-0 flex-1 text-base font-semibold tracking-[-0.03em] text-slate-800 outline-none placeholder:text-slate-400 sm:text-2xl"
                  />
                  <span className="shrink-0 text-xs text-indigo-500 sm:text-sm">{title.length}/30</span>
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
                {linkUrl && (
                  <div className="pt-3 sm:pt-4">
                    <NoteLinkCard url={linkUrl} onClick={() => setIsEmbedOpen(true)} onDelete={handleLinkDelete} />
                  </div>
                )}
                <div className="border-b border-slate-200 pt-3 sm:pt-4" />
              </>
            }
          />

          <div className="mt-auto pt-4 text-right text-xs text-slate-400 sm:text-sm">
            공백포함 {contentCharCount}자 | 공백제외 {contentNoSpaceCount}자
          </div>
        </div>
      </div>

      <NoteEmbedPanel
        open={isEmbedOpen}
        onClose={() => setIsEmbedOpen(false)}
        expanded={isEmbedExpanded}
        onToggleExpand={() => setIsEmbedExpanded((v) => !v)}
        // TODO(@<wiring>): linkUrl로부터 iframe 가능 여부 판별 + 가능하면 type:'iframe', 아니면 OG fetch 결과로 type:'metadata' 전달
        data={linkUrl ? { type: 'iframe', url: linkUrl } : undefined}
      />

      {/* 링크 업로드 모달 — Figma: 343×180 (모바일) / 456×260 (sm+). Modal 기본 width와 일치, 높이만 지정. */}
      <Modal
        open={isLinkInputOpen}
        onClose={() => setIsLinkInputOpen(false)}
        showCloseButton
        className="h-[180px] sm:h-[260px]"
      >
        <Modal.Title className="text-left text-base sm:text-xl">링크 업로드</Modal.Title>
        <input
          type="url"
          value={linkInput}
          onChange={(e) => setLinkInput(e.target.value)}
          placeholder="링크를 입력해주세요"
          aria-label="링크 URL"
          className="mt-4 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 sm:mt-6 sm:h-14 sm:text-base"
        />
        <Modal.Actions className="mt-auto">
          <Modal.Confirm className="h-10 sm:h-14" onClick={handleLinkConfirm}>
            확인
          </Modal.Confirm>
        </Modal.Actions>
      </Modal>

      {/* 작성 취소 모달 */}
      <Modal open={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} className="h-[178px] sm:h-[250px]">
        <Modal.Title className="text-center text-base sm:text-xl">노트 작성을 취소하시겠어요?</Modal.Title>
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
          <Modal.Confirm className="h-10 w-[151.5px] sm:h-14 sm:w-[190px]" onClick={() => router.back()}>
            확인
          </Modal.Confirm>
        </Modal.Actions>
      </Modal>
    </div>
  );
}
