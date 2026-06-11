import { QueryClient } from '@tanstack/react-query';

/** 요청마다 새 QueryClient — 모듈 스코프에 공유하면 요청 간 사용자 데이터가 섞인다. */
export function getQueryClient(): QueryClient {
  return new QueryClient();
}
