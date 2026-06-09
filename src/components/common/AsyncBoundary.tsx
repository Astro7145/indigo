'use client';

import { Suspense, type ReactNode } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

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
 */
export default function AsyncBoundary({ fallback, errorFallback, children, resetKeys }: AsyncBoundaryProps) {
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
