'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

// 노트 드로어의 열림 상태와 모드를 URL 쿼리파라미터(todoId·mode)로 다룬다.
// 드로어 본체는 todoId/mode를 구독해 열림·모드를 도출하고, 진입점(상세 모달 등)은 openNote로 연다.
// mode: write=노트 작성, detail=상세 읽기, edit=수정 (없으면 detail 기본값)

export type NoteDrawerMode = 'write' | 'detail' | 'edit';

function parseId(raw: string | null): number | null {
  if (raw == null || raw === '') return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

export function useNoteDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const todoId = parseId(searchParams.get('todoId'));
  const mode = (searchParams.get('mode') as NoteDrawerMode) ?? 'detail';

  const openNote = (nextTodoId: number, nextMode: NoteDrawerMode = 'detail') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('todoId', String(nextTodoId));
    params.set('mode', nextMode);
    params.delete('noteId');
    router.push(`${pathname}?${params.toString()}`);
  };

  // detail→edit: 히스토리를 쌓아 뒤로가기로 detail 복귀 가능.
  const goEdit = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('mode', 'edit');
    router.push(`${pathname}?${params.toString()}`);
  };

  // create/edit 성공 후 detail로 전환: replace로 폼 히스토리를 남기지 않는다.
  const goDetail = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('mode', 'detail');
    router.replace(`${pathname}?${params.toString()}`);
  };

  const closeNote = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('todoId');
    params.delete('mode');
    params.delete('noteId');
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return { todoId, mode, openNote, goEdit, goDetail, closeNote };
}
