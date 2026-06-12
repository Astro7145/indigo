import type { ReactElement } from 'react';
import { act, renderHook } from '@testing-library/react';

import TodoCreateContainer from '@/src/components/todo/TodoCreateContainer';
import TodoDetailContent from '@/src/components/todo/TodoDetailContent';
import TodoExitConfirm from '@/src/components/todo/TodoExitConfirm';
import TodoUpdateContainer from '@/src/components/todo/TodoUpdateContainer';
import { useTodoSheet } from '@/src/hooks/useTodoSheet';
import { useModalStore } from '@/src/stores/modal';
import type { Todo } from '@/src/types/todo';

const makeTodo = (): Todo =>
  ({ id: 7, title: '할일', done: false, goalId: null, noteIds: [], tags: [], isFavorite: false }) as never;

const controls = { close: jest.fn(), closeWithParent: jest.fn() };

beforeEach(() => {
  useModalStore.setState({ modals: [] });
  jest.clearAllMocks();
});

it('openCreate는 auto variant로 생성 컨테이너를 스택에 올리고 프리필을 전달한다', () => {
  const { result } = renderHook(() => useTodoSheet());
  act(() => result.current.openCreate({ goalId: 5, dueDate: '2025-01-10T00:00:00.000Z' }));
  const [entry] = useModalStore.getState().modals;
  expect(entry.variant).toBe('auto');
  const el = entry.render(controls) as ReactElement;
  expect(el.type).toBe(TodoCreateContainer);
  expect(el.props).toMatchObject({ defaultGoalId: 5, defaultDueDate: '2025-01-10T00:00:00.000Z' });
});

it('생성 폼의 ESC/백드롭(onClose)은 이탈 확인을 스택 위에 쌓는다', () => {
  const { result } = renderHook(() => useTodoSheet());
  act(() => result.current.openCreate());
  const [entry] = useModalStore.getState().modals;
  act(() => entry.onClose!());
  const modals = useModalStore.getState().modals;
  expect(modals).toHaveLength(2);
  const confirmEl = modals[1].render(controls) as ReactElement;
  expect(confirmEl.type).toBe(TodoExitConfirm);
});

it('제출 진행 중에는 ESC/백드롭(onClose)이 이탈 확인을 열지 않고, 끝나면 다시 연다', () => {
  const { result } = renderHook(() => useTodoSheet());
  act(() => result.current.openCreate());
  const [entry] = useModalStore.getState().modals;
  const el = entry.render(controls) as ReactElement;
  const { onPendingChange } = el.props as { onPendingChange: (pending: boolean) => void };

  act(() => onPendingChange(true));
  act(() => entry.onClose!());
  expect(useModalStore.getState().modals).toHaveLength(1); // 진행 중 — 이탈 확인이 쌓이지 않는다

  act(() => onPendingChange(false));
  act(() => entry.onClose!());
  expect(useModalStore.getState().modals).toHaveLength(2); // 끝난 뒤에는 정상적으로 열린다
});

it('openEdit은 수정 컨테이너에 todo를 전달한다', () => {
  const { result } = renderHook(() => useTodoSheet());
  act(() => result.current.openEdit(makeTodo()));
  const el = useModalStore.getState().modals[0].render(controls) as ReactElement;
  expect(el.type).toBe(TodoUpdateContainer);
  expect(el.props).toMatchObject({ todo: { id: 7 } });
});

it('openDetail은 상세 콘텐츠를 detail 패딩으로 연다', () => {
  const { result } = renderHook(() => useTodoSheet());
  act(() => result.current.openDetail(makeTodo()));
  const [entry] = useModalStore.getState().modals;
  expect(entry.className).toBe('p-10 sm:p-10');
  const el = entry.render(controls) as ReactElement;
  expect(el.type).toBe(TodoDetailContent);
});
