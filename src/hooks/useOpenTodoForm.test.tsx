import { renderHook } from '@testing-library/react';
import type { ReactElement } from 'react';

import TodoCreateContainer from '@/src/components/todo/TodoCreateContainer';
import TodoUpdateContainer from '@/src/components/todo/TodoUpdateContainer';
import { useOpenTodoForm } from '@/src/hooks/useOpenTodoForm';
import { useModalStore } from '@/src/stores/modal';
import type { Todo } from '@/src/types/todo';

type ContainerProps = { defaultGoalId?: number; todo?: Todo; onClose: () => void; onCancel: () => void };
type ConfirmProps = { onStay: () => void; onLeave: () => void };

// ModalStack과 동일하게, 스택 위치 기반 controls(맨 위 닫기 / 위 2개 닫기)를 주입해 렌더한다.
const renderEntry = <P,>(index: number) => {
  const entry = useModalStore.getState().modals[index];
  return entry.render({
    close: () => useModalStore.getState().close(),
    closeWithParent: () => useModalStore.getState().closeWithParent(),
  }) as ReactElement<P>;
};

// 훅이 반환하는 폼 오프너 함수를 꺼낸다.
const openTodoForm = () => renderHook(() => useOpenTodoForm()).result.current;

const todo = { id: 1, title: '할 일' } as Todo;

beforeEach(() => {
  useModalStore.setState({ modals: [] });
});

it('create 모드는 폼을 variant auto로 열고, ESC·백드롭(onClose)은 이탈 확인을 띄운다', () => {
  openTodoForm()({ mode: 'create' });
  const entry = useModalStore.getState().modals[0];
  expect(useModalStore.getState().modals).toHaveLength(1);
  expect(entry.variant).toBe('auto');
  // 곧장 닫지 않고 이탈 확인을 폼 위에 쌓는다(작성 내용 보호).
  expect(entry.onClose).toBeDefined();
  entry.onClose!();
  const modals = useModalStore.getState().modals;
  expect(modals).toHaveLength(2);
  expect(modals[1].variant).toBe('modal');
});

it('create 모드는 TodoCreateContainer를 defaultGoalId와 함께 렌더한다', () => {
  openTodoForm()({ mode: 'create', defaultGoalId: 7 });
  const el = renderEntry<ContainerProps>(0);
  expect(el.type).toBe(TodoCreateContainer);
  expect(el.props.defaultGoalId).toBe(7);
});

it('update 모드는 TodoUpdateContainer를 todo와 함께 렌더한다', () => {
  openTodoForm()({ mode: 'update', todo });
  const el = renderEntry<ContainerProps>(0);
  expect(el.type).toBe(TodoUpdateContainer);
  expect(el.props.todo).toBe(todo);
});

it('폼의 onCancel을 호출하면 확인 다이얼로그가 위에 쌓인다', () => {
  openTodoForm()({ mode: 'create' });
  renderEntry<ContainerProps>(0).props.onCancel();
  const modals = useModalStore.getState().modals;
  expect(modals).toHaveLength(2);
  expect(modals[1].variant).toBe('modal');
  // 기존 모양(400px) 유지를 위한 너비 오버라이드가 확인 엔트리에 실린다.
  expect(modals[1].className).toContain('w-[400px]');
});

it('확인에서 "아니오"(onStay)는 확인만 닫고 폼은 남긴다', () => {
  openTodoForm()({ mode: 'create' });
  renderEntry<ContainerProps>(0).props.onCancel();
  const confirm = renderEntry<ConfirmProps>(1);
  confirm.props.onStay();
  expect(useModalStore.getState().modals).toHaveLength(1);
});

it('확인에서 "예"(onLeave)는 확인과 폼을 모두 닫는다', () => {
  openTodoForm()({ mode: 'create' });
  renderEntry<ContainerProps>(0).props.onCancel();
  const confirm = renderEntry<ConfirmProps>(1);
  confirm.props.onLeave();
  expect(useModalStore.getState().modals).toHaveLength(0);
});

it('폼의 onClose(제출 성공)는 폼 엔트리를 닫는다', () => {
  openTodoForm()({ mode: 'create' });
  renderEntry<ContainerProps>(0).props.onClose();
  expect(useModalStore.getState().modals).toHaveLength(0);
});
