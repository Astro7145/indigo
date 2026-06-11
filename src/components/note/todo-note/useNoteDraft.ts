import type { JSONContent } from '@tiptap/core';
import { useEffect, useRef, useState } from 'react';

import type { Note } from '@/src/types/note';

const EMPTY_DOC: JSONContent = { type: 'doc', content: [] };

// Tiptap JSON 트리에 실제 text node가 있는지로 "비어있음"을 판별
function hasText(node: JSONContent): boolean {
  if (node.type === 'text' && node.text?.trim()) return true;
  return node.content?.some(hasText) ?? false;
}

// Tiptap JSON은 round-trip 안정적이라 stringify 비교로 dirty 판별 충분
function isSameJSON(a: JSONContent, b: JSONContent): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export interface NoteDraft {
  /** 편집 중엔 초안을, 읽기 중엔 원본 노트를 보여주는 표시값 */
  title: string;
  content: JSONContent;
  setTitle: (value: string) => void;
  setContent: (value: JSONContent) => void;
  /** 초안이 원본과 달라졌는지 (취소 시 확인 모달 여부) */
  isDirty: boolean;
  /** 제목·본문이 모두 채워져 저장 가능한지 */
  isValid: boolean;
}

// NoteWorkspace의 폼 초안 상태를 전담한다.
// editing이 false→true(읽기→편집)로 막 바뀐 순간에만 초안을 원본으로 리셋해,
// 이전 편집의 취소분이 다음 편집 진입 때 남지 않게 한다.
export function useNoteDraft(note: Note | undefined, editing: boolean): NoteDraft {
  const baseTitle = note?.title ?? '';
  const baseContent = (note?.content as JSONContent | undefined) ?? EMPTY_DOC;

  const [draftTitle, setDraftTitle] = useState(baseTitle);
  const [draftContent, setDraftContent] = useState<JSONContent>(baseContent);

  const wasEditing = useRef(editing);
  useEffect(() => {
    if (editing && !wasEditing.current) {
      setDraftTitle(baseTitle);
      setDraftContent(baseContent);
    }
    wasEditing.current = editing;
  }, [editing, baseTitle, baseContent]);

  return {
    title: editing ? draftTitle : baseTitle,
    content: editing ? draftContent : baseContent,
    setTitle: setDraftTitle,
    setContent: setDraftContent,
    isDirty: draftTitle !== baseTitle || !isSameJSON(draftContent, baseContent),
    isValid: draftTitle.trim().length > 0 && hasText(draftContent),
  };
}
