'use client';

// 노트 드로어 네비게이션 액션 모음. URL 상태(todoId·mode) 구독이 없어 이 훅을 쓰는
// 컴포넌트는 URL 변경으로 리렌더되지 않는다. 상태를 구독해야 하는 컴포넌트는
// useSearchParams를 직접 호출한다.
// mode: write=노트 작성, detail=상세 읽기, edit=수정

export type NoteDrawerMode = 'write' | 'detail' | 'edit';

export function useNoteDrawer() {
  const openNote = (nextTodoId: number, nextMode: NoteDrawerMode = 'detail') => {
    const params = new URLSearchParams(window.location.search);
    params.set('todoId', String(nextTodoId));
    params.set('mode', nextMode);
    params.delete('noteId');
    window.history.pushState(null, '', `${window.location.pathname}?${params.toString()}`);
  };

  // detail→edit: 히스토리를 쌓아 뒤로가기로 detail 복귀 가능.
  const goEdit = () => {
    const params = new URLSearchParams(window.location.search);
    params.set('mode', 'edit');
    window.history.pushState(null, '', `${window.location.pathname}?${params.toString()}`);
  };

  // create/edit 성공 후 detail로 전환: replace로 폼 히스토리를 남기지 않는다.
  const goDetail = () => {
    const params = new URLSearchParams(window.location.search);
    params.set('mode', 'detail');
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
  };

  const closeNote = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete('todoId');
    params.delete('mode');
    params.delete('noteId');
    const qs = params.toString();
    window.history.pushState(null, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  };

  // 확인 모달(cancelConfirm)을 통한 취소 확정 후 드로어를 닫는다.
  // ModalStack의 closeAndNavigate가 history.back()으로 pushState 진입점을 먼저 소모하므로,
  // replace로 현재 항목을 "닫힘 URL"로 덮어써야 ghost 히스토리가 남지 않는다.
  // closeNote(push)와 다르게 뒤로가기로 드로어가 재진입되지 않는 것도 의도된 동작이다.
  const cancelNote = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete('todoId');
    params.delete('mode');
    params.delete('noteId');
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  };

  return { openNote, goEdit, goDetail, closeNote, cancelNote };
}
