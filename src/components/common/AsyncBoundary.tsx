'use client';

import { Suspense, useSyncExternalStore, type ReactNode } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

// 서버(SSR/프리렌더)에선 false, 클라이언트 하이드레이션 후 true.
// useSyncExternalStore라 set-state-in-effect 없이도 하이드레이션 불일치 경고가 없다.
const subscribe = () => () => {};
function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

interface AsyncBoundaryProps {
  /** Suspense fallback — 로딩 중 표시. */
  fallback: ReactNode;
  /** ErrorBoundary fallback — 자식 throw 시 표시. */
  errorFallback: ReactNode;
  children: ReactNode;
  /**
   * 값이 바뀌면 에러 상태를 초기화한다(예: [tab, keyword]). 탭·필터 변경 후 에러 화면에 갇히는 것을 방지.
   * `QueryErrorResetBoundary`와 묶여 있어, 리셋 시 쿼리 에러까지 풀려 재요청된다 — 같은 쿼리에
   * 대한 클라이언트 필터 변경(예: /favorites)에서도 복구된다.
   */
  resetKeys?: unknown[];
}

/**
 * Suspense + ErrorBoundary(react-error-boundary) 묶음. 데이터 컴포넌트가 본문을 감싸
 * 로딩/에러를 선언적으로 처리한다. 정적 errorFallback을 fragment로 감싸 ReactElement 요구를 만족시킨다.
 *
 * 데이터 페칭은 **클라이언트 전용**이다 — 클라 fetcher의 상대 baseURL(`/api`)은 서버에서 무효라
 * SSR/프리렌더 중 useSuspenseQuery가 실행되면 "Invalid URL"로 터진다(SSR 프리페치는 #136으로 보류).
 * 그래서 서버에선 children을 렌더하지 않고 로딩 fallback만 내보내고, 하이드레이션 후 클라에서 실제 조회한다.
 * 이렇게 하면 페이지는 정적 셸로 프리렌더되고(force-dynamic 불필요) 서버 페칭 크래시도 없다.
 */
export default function AsyncBoundary({ fallback, errorFallback, children, resetKeys }: AsyncBoundaryProps) {
  const isClient = useIsClient();
  if (!isClient) return <>{fallback}</>;

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} resetKeys={resetKeys} fallback={<>{errorFallback}</>}>
          <Suspense fallback={fallback}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
