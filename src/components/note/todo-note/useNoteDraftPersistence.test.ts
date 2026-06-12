import type { JSONContent } from '@tiptap/core';
import { act, renderHook } from '@testing-library/react';

import { useToastStore } from '@/src/stores/toast';

import { loadDraft, saveDraft } from './noteDraftStorage';
import { useNoteDraftPersistence } from './useNoteDraftPersistence';

const content: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: '임시 본문' }] }],
};

beforeEach(() => {
  localStorage.clear();
  useToastStore.setState({ isOpen: false, message: '', variant: 'success' });
});

it('편집 진입 시 저장된 초안이 있으면 불러오기 프롬프트가 열린다', () => {
  saveDraft(12, { title: '임시 제목', content });

  const { result } = renderHook(() => useNoteDraftPersistence({ todoId: 12, editing: true, applyDraft: jest.fn() }));

  expect(result.current.promptOpen).toBe(true);
});

it('저장된 초안이 없으면 프롬프트가 열리지 않는다', () => {
  const { result } = renderHook(() => useNoteDraftPersistence({ todoId: 12, editing: true, applyDraft: jest.fn() }));

  expect(result.current.promptOpen).toBe(false);
});

it('읽기 모드에선 초안이 있어도 프롬프트가 열리지 않는다', () => {
  saveDraft(12, { title: '임시 제목', content });

  const { result } = renderHook(() => useNoteDraftPersistence({ todoId: 12, editing: false, applyDraft: jest.fn() }));

  expect(result.current.promptOpen).toBe(false);
});

it('읽기→편집 전환 시 저장된 초안이 있으면 프롬프트가 열린다', () => {
  saveDraft(12, { title: '임시 제목', content });

  const { result, rerender } = renderHook(
    ({ editing }) => useNoteDraftPersistence({ todoId: 12, editing, applyDraft: jest.fn() }),
    { initialProps: { editing: false } },
  );
  expect(result.current.promptOpen).toBe(false);

  rerender({ editing: true });
  expect(result.current.promptOpen).toBe(true);
});

it('불러오기 확인 시 저장된 초안을 적용하고 프롬프트를 닫는다', () => {
  saveDraft(12, { title: '임시 제목', content });
  const applyDraft = jest.fn();

  const { result } = renderHook(() => useNoteDraftPersistence({ todoId: 12, editing: true, applyDraft }));

  act(() => result.current.confirmLoad());

  expect(applyDraft).toHaveBeenCalledWith(expect.objectContaining({ title: '임시 제목', content }));
  expect(result.current.promptOpen).toBe(false);
});

it('불러오기를 닫으면 초안을 적용하지 않고 프롬프트만 닫는다', () => {
  saveDraft(12, { title: '임시 제목', content });
  const applyDraft = jest.fn();

  const { result } = renderHook(() => useNoteDraftPersistence({ todoId: 12, editing: true, applyDraft }));

  act(() => result.current.dismissPrompt());

  expect(applyDraft).not.toHaveBeenCalled();
  expect(result.current.promptOpen).toBe(false);
  // 닫아도 초안 자체는 유지된다
  expect(loadDraft(12)).not.toBeNull();
});

it('임시저장하면 현재 제목·본문이 보관되고 성공 토스트가 뜬다', () => {
  const { result } = renderHook(() => useNoteDraftPersistence({ todoId: 12, editing: true, applyDraft: jest.fn() }));

  act(() => result.current.save({ title: '쓰던 제목', content }));

  expect(loadDraft(12)?.title).toBe('쓰던 제목');
  expect(useToastStore.getState().message).toBe('임시 저장되었어요.');
  expect(useToastStore.getState().variant).toBe('success');
});

it('초안을 비우면 저장된 초안이 사라진다', () => {
  saveDraft(12, { title: '임시 제목', content });

  const { result } = renderHook(() => useNoteDraftPersistence({ todoId: 12, editing: true, applyDraft: jest.fn() }));

  act(() => result.current.clear());

  expect(loadDraft(12)).toBeNull();
});
