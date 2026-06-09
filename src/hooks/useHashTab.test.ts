import { act, renderHook } from '@testing-library/react';
import { useHashTab } from '@/src/hooks/useHashTab';

const TABS = ['all', 'todo', 'done'] as const;

beforeEach(() => {
  window.history.replaceState(null, '', '/');
});

it('해시가 없으면 defaultTab을 반환한다', () => {
  const { result } = renderHook(() => useHashTab(TABS, 'all'));
  expect(result.current[0]).toBe('all');
});

it('초기 해시가 유효하면 해당 탭을 반환한다', () => {
  window.history.replaceState(null, '', '/#done');
  const { result } = renderHook(() => useHashTab(TABS, 'all'));
  expect(result.current[0]).toBe('done');
});

it('해시가 tabs에 없으면 defaultTab을 반환한다', () => {
  window.history.replaceState(null, '', '/#nope');
  const { result } = renderHook(() => useHashTab(TABS, 'all'));
  expect(result.current[0]).toBe('all');
});

it('setTab은 해시를 갱신하고 탭을 바꾼다', () => {
  const { result } = renderHook(() => useHashTab(TABS, 'all'));
  act(() => result.current[1]('todo'));
  expect(window.location.hash).toBe('#todo');
  expect(result.current[0]).toBe('todo');
});

it('setTab(defaultTab)은 해시를 제거한다', () => {
  window.history.replaceState(null, '', '/#done');
  const { result } = renderHook(() => useHashTab(TABS, 'all'));
  act(() => result.current[1]('all'));
  expect(window.location.hash).toBe('');
  expect(result.current[0]).toBe('all');
});

it('hashchange(뒤로/앞으로 등)에 동기화된다', () => {
  const { result } = renderHook(() => useHashTab(TABS, 'all'));
  act(() => {
    window.history.replaceState(null, '', '/#done');
    window.dispatchEvent(new Event('hashchange'));
  });
  expect(result.current[0]).toBe('done');
});
