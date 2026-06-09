'use client';

import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * 최소 ErrorBoundary — 자식 렌더/throw(useSuspenseQuery 에러 포함)를 잡아 fallback을 렌더한다.
 * reset/retry는 두지 않는다(정적 fallback). 네비게이션 시 remount로 자연 초기화된다.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
