import { act, renderHook } from '@testing-library/react';
import { useIsMobile } from '@/src/hooks/useIsMobile';

// Jest의 jsdom 환경에는 window.matchMedia가 구현돼 있지 않습니다.
// 실제 브라우저처럼 화면 크기를 바꿀 수도 없습니다.
// 그래서 두 가지를 직접 만들어야 합니다.

function setupMatchMedia(isMobile: boolean) {
  const mediaQueryList = {
    matches: isMobile,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn(() => mediaQueryList),
  });

  const fireChange = (nextIsMobile: boolean) => {
    const [, handler] = mediaQueryList.addEventListener.mock.calls[0];
    handler({ matches: nextIsMobile });
  };

  return { mediaQueryList, fireChange };
}

it('모바일 화면(743px 이하)일 때 true를 반환한다', () => {
  setupMatchMedia(true);
  const { result } = renderHook(() => useIsMobile());
  expect(result.current).toBe(true);
});

it('데스크톱 화면(744px 이상)일 때 false를 반환한다', () => {
  setupMatchMedia(false);
  const { result } = renderHook(() => useIsMobile());
  expect(result.current).toBe(false);
});

it('화면이 데스크톱에서 모바일로 바뀌면 true로 업데이트된다', () => {
  const { fireChange } = setupMatchMedia(false);
  const { result } = renderHook(() => useIsMobile());
  expect(result.current).toBe(false);
  act(() => fireChange(true));
  expect(result.current).toBe(true);
});

it('화면이 모바일에서 데스크톱으로 바뀌면 false로 업데이트된다', () => {
  const { fireChange } = setupMatchMedia(true);
  const { result } = renderHook(() => useIsMobile());
  expect(result.current).toBe(true);
  act(() => fireChange(false));
  expect(result.current).toBe(false);
});

it('언마운트 시 이벤트 리스너가 해제된다', () => {
  const { mediaQueryList } = setupMatchMedia(false);
  const { unmount } = renderHook(() => useIsMobile());
  unmount();
  expect(mediaQueryList.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
});
