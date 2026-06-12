'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from 'next-auth/react';
import { useState, type ReactNode } from 'react';

// QueryClient는 컴포넌트 인스턴스마다 한 번만 생성한다 (useState 초기값).
// 모듈 스코프에 두면 SSR 환경에서 요청 간 캐시가 공유되어 사용자 데이터가 섞일 수 있다.
export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 마운트마다 즉시 refetch되는 기본값(staleTime:0)이 너무 공격적이라
            // 1분을 baseline으로. 도메인별 override는 후속 이슈에서.
            staleTime: 60 * 1000,
            // 탭 전환마다 refetch는 UX 호불호가 큰 옵션이라 default off.
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} position="top" buttonPosition="bottom-right" />
        )}
      </QueryClientProvider>
    </SessionProvider>
  );
}
