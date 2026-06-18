'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, type RefObject } from 'react';

import AsyncBoundary from '@/src/components/common/AsyncBoundary';
import NoteWorkspace, { type NoteWorkspaceHandle } from '@/src/components/note/todo-note/NoteWorkspace';
import { useNoteDrawer, type NoteDrawerMode } from '@/src/hooks/note/useNoteDrawer';
import { useNoteListSuspense } from '@/src/hooks/note/note';
import { useTodo } from '@/src/hooks/todo';
import { useModalStore } from '@/src/stores/modal';
import { lockScroll, unlockScroll } from '@/src/utils/scrollLock';

const EMPTY_NOTE_LIST = { notes: [], nextCursor: null, totalCount: 0 };

function parseId(raw: string | null): number | null {
  if (raw == null || raw === '') return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

// 쿼리파라미터(todoId·mode)를 구독해 열리는 전역 노트 드로어. (main) 레이아웃에 상시 마운트된다.
// todoId가 없으면 닫힘(렌더 안 함). 열림 판단은 오직 todoId 존재 여부다.
export default function NoteDrawer() {
  const t = useTranslations('note');
  const tc = useTranslations('common');
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  // NoteWorkspace의 requestClose를 ref로 참조해 ESC 트리거 시 호출한다.
  // dirty 판단과 확인 모달은 폼이 전담한다.
  const workspaceRef = useRef<NoteWorkspaceHandle>(null);
  const todoId = parseId(searchParams.get('todoId'));

  useEffect(() => {
    if (todoId == null) return;
    lockScroll();
    return () => unlockScroll();
  }, [todoId]);

  useEffect(() => {
    if (todoId == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (useModalStore.getState().modals.length > 0) return; // 스택 모달에 양보
      e.stopPropagation();
      workspaceRef.current?.requestClose();
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [todoId]);

  return (
    <AnimatePresence>
      {todoId != null && (
        <div key="note-drawer" className="fixed inset-0 z-60">
          <motion.div
            className="absolute inset-0 bg-black/30"
            aria-hidden
            onClick={() => workspaceRef.current?.requestClose()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('ariaLabel')}
            className="absolute inset-y-0 right-0 flex w-full flex-col overflow-y-auto bg-slate-100 px-4 py-6 shadow-2xl sm:px-6 sm:py-12 xl:w-[40%] xl:min-w-[650px] xl:px-10"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', damping: 30, stiffness: 300 }}
          >
            <AsyncBoundary
              fallback={
                <p className="flex h-full items-center justify-center text-sm text-slate-400">{tc('state.loading')}</p>
              }
              errorFallback={
                <p className="flex h-full items-center justify-center text-sm text-slate-400">{t('loadError')}</p>
              }
            >
              <NoteDrawerContent todoId={todoId} workspaceRef={workspaceRef} />
            </AsyncBoundary>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// AsyncBoundary 아래에서 데이터를 조회하고 NoteWorkspace를 렌더한다.
function NoteDrawerContent({
  todoId,
  workspaceRef,
}: {
  todoId: number;
  workspaceRef: RefObject<NoteWorkspaceHandle | null>;
}) {
  const searchParams = useSearchParams();
  const mode = (searchParams.get('mode') as NoteDrawerMode) ?? 'detail';
  const { goEdit, goDetail, closeNote, cancelNote } = useNoteDrawer();
  const { data } = useNoteListSuspense(
    { todoId },
    mode === 'write' ? { initialData: EMPTY_NOTE_LIST, staleTime: Infinity } : undefined,
  );
  // 메타(목표·할일·태그)용 full todo — 보조 데이터라 비-suspense 유지. NoteWorkspace가 note.todo로 폴백.
  const { data: todo } = useTodo(todoId);

  const note = data?.notes[0];
  // desync 가드: mode가 detail/edit인데 실제 노트가 없으면 create로 폴백.
  const resolvedMode = !note ? 'create' : mode === 'edit' ? 'edit' : 'read';

  return (
    <NoteWorkspace
      ref={workspaceRef}
      todoId={todoId}
      note={note}
      todo={todo}
      mode={resolvedMode}
      onEdit={goEdit}
      // create·edit 성공 모두 detail로. create는 lists() invalidate→리페치로 note가 채워져 자동 상세 전환.
      onComplete={goDetail}
      // 작성 취소는 드로어를 닫고, 수정 취소는 상세로 복귀한다.
      onCancel={resolvedMode === 'edit' ? goDetail : cancelNote}
      onClose={closeNote}
    />
  );
}
