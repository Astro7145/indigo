import { act, renderHook } from '@testing-library/react';
import type { ReactElement } from 'react';

import { useModalStore } from '@/src/stores/modal';

import { useNoteLink } from './useNoteLink';

// 최상단 스택 엔트리의 render를 controls와 함께 호출해 콘텐츠(NoteLinkInput)의 props를 꺼낸다.
type LinkInputProps = { initialUrl: string; onConfirm: (url: string) => void; onClose: () => void };
const renderTopEntry = () => {
  const { modals } = useModalStore.getState();
  const entry = modals[modals.length - 1];
  return entry.render({
    close: () => useModalStore.getState().close(),
    closeWithParent: () => useModalStore.getState().closeWithParent(),
  }) as ReactElement<LinkInputProps>;
};

beforeEach(() => {
  useModalStore.setState({ modals: [] });
});

it('openInput을 호출하면 모달 스택에 입력 다이얼로그가 열린다', () => {
  const { result } = renderHook(() => useNoteLink({ linkUrl: null, setLinkUrl: jest.fn() }));

  act(() => result.current.openInput());

  expect(useModalStore.getState().modals).toHaveLength(1);
});

it('openInput이 띄운 다이얼로그는 현재 linkUrl을 prefill로 받는다', () => {
  const { result } = renderHook(() => useNoteLink({ linkUrl: 'https://example.com', setLinkUrl: jest.fn() }));

  act(() => result.current.openInput());

  expect(renderTopEntry().props.initialUrl).toBe('https://example.com');
});

it('다이얼로그에서 확인하면 setLinkUrl이 호출되고 스택이 닫힌다', () => {
  const setLinkUrl = jest.fn();
  const { result } = renderHook(() => useNoteLink({ linkUrl: null, setLinkUrl }));

  act(() => result.current.openInput());
  act(() => renderTopEntry().props.onConfirm('https://example.com'));

  expect(setLinkUrl).toHaveBeenCalledWith('https://example.com');
  expect(useModalStore.getState().modals).toHaveLength(0);
});

it('다이얼로그에서 닫기를 호출하면 스택이 닫힌다', () => {
  const { result } = renderHook(() => useNoteLink({ linkUrl: null, setLinkUrl: jest.fn() }));

  act(() => result.current.openInput());
  act(() => renderTopEntry().props.onClose());

  expect(useModalStore.getState().modals).toHaveLength(0);
});

it('remove를 호출하면 setLinkUrl(null)이 호출된다', () => {
  const setLinkUrl = jest.fn();
  const { result } = renderHook(() => useNoteLink({ linkUrl: 'https://example.com', setLinkUrl }));

  act(() => result.current.remove());

  expect(setLinkUrl).toHaveBeenCalledWith(null);
});
