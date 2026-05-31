'use client';

import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { ReactNode } from 'react';

import EditorToolbar from '@/src/components/common/editor/EditorToolbar';

export interface PostEditorProps {
  value: string;
  onChange: (html: string) => void;
  onImageClick?: () => void;
  placeholder?: string;
  /** 툴바 아래, 본문 위에 렌더할 영역 (제목 input 등) */
  titleSlot?: ReactNode;
  /** EditorContent 래퍼에 적용할 클래스 (min-h 등) */
  contentClassName?: string;
}

export default function PostEditor({
  value,
  onChange,
  onImageClick,
  placeholder,
  titleSlot,
  contentClassName,
}: PostEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: placeholder ?? '' }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

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
        showLink={false}
        onBold={() => editor?.chain().focus().toggleBold().run()}
        onItalic={() => editor?.chain().focus().toggleItalic().run()}
        onUnderline={() => editor?.chain().focus().toggleUnderline().run()}
        onAlignLeft={() => editor?.chain().focus().setTextAlign('left').run()}
        onAlignCenter={() => editor?.chain().focus().setTextAlign('center').run()}
        onAlignRight={() => editor?.chain().focus().setTextAlign('right').run()}
        onBulletList={() => editor?.chain().focus().toggleBulletList().run()}
        onImageUpload={onImageClick}
      />
      {titleSlot}
      <EditorContent editor={editor} className={contentClassName} />
    </div>
  );
}
