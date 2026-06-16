'use client';

import type { JSONContent } from '@tiptap/core';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useImperativeHandle, useRef, type ReactNode, type Ref } from 'react';

import EditorToolbar from '@/src/components/common/editor/EditorToolbar';

export interface NoteContentEditorHandle {
  focus: () => void;
}

export interface NoteContentEditorProps {
  value: JSONContent;
  onChange?: (json: JSONContent) => void;
  /** false면 읽기 전용 렌더(툴바 없음). 기본 true */
  editable?: boolean;
  placeholder?: string;
  /** 전달하면 툴바에 링크 삽입 버튼이 노출되고 클릭 시 호출된다 */
  onLink?: () => void;
  /** 툴바 아래, 본문 위에 렌더할 영역 (제목 input 등) */
  titleSlot?: ReactNode;
  /** 제목과 본문 사이에 렌더할 영역 (메타 정보 등) */
  attachmentSlot?: ReactNode;
  /** EditorContent 래퍼에 적용할 클래스 (min-h 등) */
  contentClassName?: string;
  ref?: Ref<NoteContentEditorHandle>;
}

// NoteEditor를 참고하되 링크/이미지 툴바를 제거하고 editable 분기를 추가한 신규 래퍼.
export default function NoteContentEditor({
  value,
  onChange,
  editable = true,
  placeholder,
  onLink,
  titleSlot,
  attachmentSlot,
  contentClassName,
  ref,
}: NoteContentEditorProps) {
  // 매 키 입력마다 getJSON() 트리 순회를 피하기 위한 마지막 동기화 JSON 캐시
  const lastContentRef = useRef<string>(JSON.stringify(value));

  const editor = useEditor({
    editable,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: placeholder ?? '' }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      lastContentRef.current = JSON.stringify(json);
      onChange?.(json);
    },
  });

  // useEditor.content는 마운트 시점에만 소비되므로, value가 비동기로 바뀌면 직접 주입한다.
  useEffect(() => {
    if (!editor) return;
    const valueStr = JSON.stringify(value);
    if (valueStr === lastContentRef.current) return;
    lastContentRef.current = valueStr;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  // editable이 토글돼도 에디터를 재생성하지 않고 모드만 바꾼다 — 상세↔수정 전환 시 인스턴스 유지(깜빡임 방지).
  useEffect(() => {
    editor?.setEditable(editable);
  }, [editor, editable]);

  const reduceMotion = useReducedMotion();

  useImperativeHandle(ref, () => ({ focus: () => editor?.chain().focus().run() }), [editor]);

  const state = useEditorState({
    editor: editable ? editor : null,
    selector: ({ editor }) =>
      editor
        ? {
            isBold: editor.isActive('bold'),
            isItalic: editor.isActive('italic'),
            isUnderline: editor.isActive('underline'),
            isAlignLeft: editor.isActive({ textAlign: 'left' }),
            isAlignCenter: editor.isActive({ textAlign: 'center' }),
            isAlignRight: editor.isActive({ textAlign: 'right' }),
            isBulletList: editor.isActive('bulletList'),
          }
        : {},
  });

  return (
    <div>
      {/* 툴바는 항상 마운트해두고 editable에 따라 높이를 접는다 — 상세↔수정 전환 시 별도 공간 예약 없이 자연스럽게 펼쳐지고, aria-hidden으로 읽기 모드에선 접근성 트리에서도 제외된다. */}
      <motion.div
        aria-hidden={!editable}
        initial={false}
        animate={{ height: editable ? 'auto' : 0, opacity: editable ? 1 : 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
        className={editable ? 'overflow-hidden pb-[29px]' : 'pointer-events-none overflow-hidden'}
      >
        <EditorToolbar
          state={state ?? {}}
          showImageUpload={false}
          showLink={!!onLink}
          onLink={onLink}
          onBold={() => editor?.chain().focus().toggleBold().run()}
          onItalic={() => editor?.chain().focus().toggleItalic().run()}
          onUnderline={() => editor?.chain().focus().toggleUnderline().run()}
          onAlignLeft={() => editor?.chain().focus().setTextAlign('left').run()}
          onAlignCenter={() => editor?.chain().focus().setTextAlign('center').run()}
          onAlignRight={() => editor?.chain().focus().setTextAlign('right').run()}
          onBulletList={() => editor?.chain().focus().toggleBulletList().run()}
        />
      </motion.div>
      {titleSlot}
      {attachmentSlot}
      <EditorContent editor={editor} className={contentClassName} />
    </div>
  );
}
