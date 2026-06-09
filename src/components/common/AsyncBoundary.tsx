'use client';

import { Suspense, type ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface AsyncBoundaryProps {
  /** Suspense fallback — 로딩 중 표시. */
  fallback: ReactNode;
  /** ErrorBoundary fallback — 자식 throw 시 표시. */
  errorFallback: ReactNode;
  children: ReactNode;
}

/**
 * Suspense + ErrorBoundary(react-error-boundary) 묶음. 데이터 컴포넌트가 본문을 감싸
 * 로딩/에러를 선언적으로 처리한다. 정적 errorFallback을 fragment로 감싸 ReactElement 요구를 만족시킨다.
 */
export default function AsyncBoundary({ fallback, errorFallback, children }: AsyncBoundaryProps) {
  return (
    <ErrorBoundary fallback={<>{errorFallback}</>}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}
