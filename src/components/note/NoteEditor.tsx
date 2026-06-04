'use client';

import type { JSONContent } from '@tiptap/core';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useImperativeHandle, useRef, type ReactNode, type Ref } from 'react';

import EditorToolbar from '@/src/components/common/editor/EditorToolbar';

export interface NoteEditorHandle {
  focus: () => void;
}

export interface NoteEditorProps {
  value: JSONContent;
  onChange: (json: JSONContent) => void;
  onLinkInsertClick?: () => void;
  placeholder?: string;
  /** 툴바 아래, 본문 위에 렌더할 영역 (제목 input 등) */
  titleSlot?: ReactNode;
  /** 제목과 본문 사이에 렌더할 영역 (메타 정보, 링크 카드 등) */
  attachmentSlot?: ReactNode;
  /** EditorContent 래퍼에 적용할 클래스 (min-h 등) */
  contentClassName?: string;
  /** 외부에서 에디터 포커스를 제어하기 위한 ref */
  ref?: Ref<NoteEditorHandle>;
}

export default function NoteEditor({
  value,
  onChange,
  onLinkInsertClick,
  placeholder,
  titleSlot,
  attachmentSlot,
  contentClassName,
  ref,
}: NoteEditorProps) {
  // 마지막으로 동기화된 JSON 문자열을 캐시 — 매 키 입력마다 editor.getJSON() 트리 순회를 피한다
  const lastContentRef = useRef<string>(JSON.stringify(value));

  const editor = useEditor({
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
      onChange(json);
    },
  });

  // useEditor.content는 마운트 시점에만 소비되므로, 수정 페이지처럼 value가 비동기로 도착하면 직접 주입해야 한다.
  // ref 캐시 비교 가드로 사용자 타이핑 중 커서 리셋을 방지 (PostEditor의 getHTML 가드와 동일 의도)
  useEffect(() => {
    if (!editor) return;
    const valueStr = JSON.stringify(value);
    if (valueStr === lastContentRef.current) return;
    lastContentRef.current = valueStr;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => editor?.chain().focus().run(),
    }),
    [editor],
  );

  const state = useEditorState({
    editor,
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
      <EditorToolbar
        state={state ?? {}}
        showImageUpload={false}
        showLink={true}
        onBold={() => editor?.chain().focus().toggleBold().run()}
        onItalic={() => editor?.chain().focus().toggleItalic().run()}
        onUnderline={() => editor?.chain().focus().toggleUnderline().run()}
        onAlignLeft={() => editor?.chain().focus().setTextAlign('left').run()}
        onAlignCenter={() => editor?.chain().focus().setTextAlign('center').run()}
        onAlignRight={() => editor?.chain().focus().setTextAlign('right').run()}
        onBulletList={() => editor?.chain().focus().toggleBulletList().run()}
        onLink={onLinkInsertClick}
      />
      {titleSlot}
      {attachmentSlot}
      <EditorContent editor={editor} className={contentClassName} />
    </div>
  );
}
