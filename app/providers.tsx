'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode } from 'react'

// QueryClient는 컴포넌트 인스턴스마다 한 번만 생성한다 (useState 초기값).
// 모듈 스코프에 두면 SSR 환경에서 요청 간 캐시가 공유되어 사용자 데이터가 섞일 수 있다.
export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
