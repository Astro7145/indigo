import { act, renderHook } from '@testing-library/react';

import { useDebounce } from '@/src/hooks/useDebounce';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

it('초기값을 즉시 반환한다', () => {
  const { result } = renderHook(() => useDebounce('초기값'));
  expect(result.current).toBe('초기값');
});

it('값이 변경되어도 delay 이전에는 이전 값을 유지한다', () => {
  const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
    initialProps: { value: '처음' },
  });
  rerender({ value: '변경됨' });
  act(() => jest.advanceTimersByTime(299));
  expect(result.current).toBe('처음');
});

it('delay 경과 후 새 값으로 업데이트된다', () => {
  const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
    initialProps: { value: '처음' },
  });
  rerender({ value: '변경됨' });
  act(() => jest.advanceTimersByTime(300));
  expect(result.current).toBe('변경됨');
});

it('delay 이전 재변경 시 타이머가 리셋되어 마지막 값만 반영된다', () => {
  const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
    initialProps: { value: '처음' },
  });
  rerender({ value: '중간' });
  act(() => jest.advanceTimersByTime(200));
  rerender({ value: '마지막' });
  act(() => jest.advanceTimersByTime(200)); // 중간 타이머 만료 시점, 아직 미반영이어야 함
  expect(result.current).toBe('처음');
  act(() => jest.advanceTimersByTime(100)); // 마지막 타이머 만료
  expect(result.current).toBe('마지막');
});

it('delay를 지정하지 않으면 기본값 300ms가 적용된다', () => {
  const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
    initialProps: { value: '처음' },
  });
  rerender({ value: '변경됨' });
  act(() => jest.advanceTimersByTime(299));
  expect(result.current).toBe('처음');
  act(() => jest.advanceTimersByTime(1));
  expect(result.current).toBe('변경됨');
});

it('언마운트 시 타이머가 정리되어 값이 업데이트되지 않는다', () => {
  const { result, rerender, unmount } = renderHook(({ value }) => useDebounce(value, 300), {
    initialProps: { value: '처음' },
  });
  rerender({ value: '변경됨' });
  unmount();
  act(() => jest.runAllTimers());
  expect(result.current).toBe('처음');
});
