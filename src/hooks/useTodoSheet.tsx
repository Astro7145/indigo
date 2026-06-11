'use client';

import TodoCreateContainer from '@/src/components/todo/TodoCreateContainer';
import TodoDetailContent from '@/src/components/todo/TodoDetailContent';
import TodoExitConfirm from '@/src/components/todo/TodoExitConfirm';
import TodoUpdateContainer from '@/src/components/todo/TodoUpdateContainer';
import { useModalStore } from '@/src/stores/modal';
import type { Todo } from '@/src/types/todo';

/** 이탈 확인 모달 — 모바일에서도 가운데 고정 폭(시트가 아님). */
const EXIT_CONFIRM_CLASS = 'w-[400px] pt-8 pb-6 sm:w-[400px] sm:pt-10 sm:pb-8';
/** 생성/수정 폼 모달 패딩. */
const FORM_CLASS = 'p-4 sm:p-8';
/** 상세 모달 패딩 — 디자인의 p-40 균일. */
const DETAIL_CLASS = 'p-10 sm:p-10';

/**
 * 할일 생성/수정/상세 시트를 전역 모달 스택(#148)으로 여는 오프너. 이슈 #136.
 * 시트 인스턴스·isOpen 상태가 필요 없고, 모바일=바텀시트/데스크탑=모달은 variant 'auto'가 해석한다.
 * 폼의 ESC·백드롭·취소는 이탈 확인을 스택 위에 쌓고(LIFO), "예"는 confirm+폼을 함께 닫는다.
 */
export function useTodoSheet() {
  const open = useModalStore((s) => s.open);

  const openExitConfirm = () =>
    open((c) => <TodoExitConfirm onStay={c.close} onLeave={c.closeWithParent} />, {
      variant: 'modal',
      className: EXIT_CONFIRM_CLASS,
    });

  const openCreate = (opts?: { goalId?: number; dueDate?: string }) =>
    open(
      (c) => (
        <TodoCreateContainer
          defaultGoalId={opts?.goalId}
          defaultDueDate={opts?.dueDate}
          onClose={c.close}
          onCancel={openExitConfirm}
        />
      ),
      { variant: 'auto', onClose: openExitConfirm, className: FORM_CLASS },
    );

  const openEdit = (todo: Todo) =>
    open((c) => <TodoUpdateContainer todo={todo} onClose={c.close} onCancel={openExitConfirm} />, {
      variant: 'auto',
      onClose: openExitConfirm,
      className: FORM_CLASS,
    });

  const openDetail = (todo: Todo) =>
    open((c) => <TodoDetailContent todo={todo} onClose={c.close} />, {
      variant: 'auto',
      className: DETAIL_CLASS,
    });

  return { openCreate, openEdit, openDetail };
}
