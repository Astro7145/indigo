import { QueryClient } from '@tanstack/react-query';

/**
 * 요청마다 새 QueryClient — 모듈 스코프에 공유하면 요청 간 사용자 데이터가 섞인다.
 * 서버에선 재시도가 곧 TTFB 지연이라 retry를 끈다 — prefetch 실패는 클라 재시도로 위임된다.
 */
export function getQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}
