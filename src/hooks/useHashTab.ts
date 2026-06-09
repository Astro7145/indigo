import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

/**
 * URL 해시(`#todo` 등)와 탭 값을 동기화한다.
 * - `defaultTab`은 해시 없이 표현한다(예: ALL = `/todos`). 없거나 tabs에 없는 해시는 defaultTab으로 떨어진다.
 * - 탭 전환은 `history.replaceState`라 히스토리에 쌓이지 않는다(뒤로가기는 진입 이전으로).
 * - `useSyncExternalStore`로 SSR 안전(서버 스냅샷 = defaultTab) + 하이드레이션 미스매치를 피한다.
 *   replaceState는 hashchange를 발생시키지 않으므로 수동 dispatch로 구독자에 알린다.
 */
export function useHashTab<T extends string>(tabs: readonly T[], defaultTab: T): [T, (tab: T) => void] {
  const getSnapshot = (): T => {
    const hash = window.location.hash.replace(/^#/, '');
    return (tabs as readonly string[]).includes(hash) ? (hash as T) : defaultTab;
  };

  const tab = useSyncExternalStore(subscribe, getSnapshot, () => defaultTab);

  const setTab = (next: T) => {
    const { pathname, search } = window.location;
    const url = next === defaultTab ? `${pathname}${search}` : `${pathname}${search}#${next}`;
    window.history.replaceState(null, '', url);
    window.dispatchEvent(new Event('hashchange'));
  };

  return [tab, setTab];
}
