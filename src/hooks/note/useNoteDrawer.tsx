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

// openNote의 URL 빌드 로직 — useNoteDrawer·useOpenNote 둘 다에서 공유한다.
// scroll:false — 드로어는 오버레이라 URL만 바꿀 뿐, 뒤 페이지 스크롤을 맨 위로 보내면 안 된다.
function pushOpenNote(
  router: ReturnType<typeof useRouter>,
  search: string,
  pathname: string,
  todoId: number,
  mode: NoteDrawerMode,
) {
  const params = new URLSearchParams(search);
  params.set('todoId', String(todoId));
  params.set('mode', mode);
  params.delete('noteId');
  router.push(`${pathname}?${params.toString()}`, { scroll: false });
}

// 노트 드로어를 "여는" 동작만 필요한 호출부(예: 목록의 행마다 마운트되는 트리거) 전용 경량 훅.
// useSearchParams를 구독하지 않아 URL이 바뀌어도 이 훅을 쓰는 컴포넌트가 리렌더되지 않는다.
// 현재 URL은 클릭 시점에 window.location에서 직접 읽는다 — todoId/mode 값을 구독해야 하는
// 드로어 본체(NoteDrawer)는 계속 useNoteDrawer를 쓴다.
export function useOpenNote() {
  const router = useRouter();

  const openNote = (nextTodoId: number, nextMode: NoteDrawerMode = 'detail') =>
    pushOpenNote(router, window.location.search, window.location.pathname, nextTodoId, nextMode);

  return { openNote };
}

export function useNoteDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const todoId = parseId(searchParams.get('todoId'));
  const mode = (searchParams.get('mode') as NoteDrawerMode) ?? 'detail';

  const openNote = (nextTodoId: number, nextMode: NoteDrawerMode = 'detail') =>
    pushOpenNote(router, searchParams.toString(), pathname, nextTodoId, nextMode);

  // detail→edit: 히스토리를 쌓아 뒤로가기로 detail 복귀 가능.
  const goEdit = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('mode', 'edit');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // create/edit 성공 후 detail로 전환: replace로 폼 히스토리를 남기지 않는다.
  const goDetail = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('mode', 'detail');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const closeNote = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('todoId');
    params.delete('mode');
    params.delete('noteId');
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return { todoId, mode, openNote, goEdit, goDetail, closeNote };
}
