import axios, { AxiosError, type AxiosInstance } from 'axios';
import { ApiError, ErrorBody } from '@/src/types/common';

// 클라이언트는 BFF 동일 오리진 프록시 `/api`만 호출한다 (상수 — 환경별로 변하지 않음).
// 외부 백엔드 주소·teamId는 서버 전용 env(BACKEND_*)로만 주입되며 클라이언트에 노출되지 않는다.
const instance: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// AsyncBoundary 클라 게이트(#137)를 대체하는 invariant (#136): 클라 전용 fetcher가 SSR에서 돌면
// 해당 라우트의 prefetch 커버가 누락된 것이다. 조용한 "Invalid URL" 대신 이름 붙은 에러로 드러낸다.
// React 스트리밍 SSR이 해당 Suspense 경계만 fallback으로 강등하고 클라가 재시도하므로 화면은 유지된다.
instance.interceptors.request.use((config) => {
  if (typeof window === 'undefined') {
    throw new Error(`client fetcher ran during SSR — missing prefetch coverage (#136): ${config.url}`);
  }
  return config;
});

function toApiError(error: AxiosError): ApiError {
  const res = error.response;
  if (!res) {
    return new ApiError({ status: 0, message: error.message || 'Network Error' });
  }
  const data = res.data as ErrorBody | undefined;
  return new ApiError({
    status: res.status,
    code: data?.code,
    message: data?.message ?? error.message,
    details: res.data,
  });
}

// 인가 실패(401)면 로그인 페이지로 보낼지 판단한다.
// - 401 status가 아니면 모두 통과시켜 mutation/query의 onError로 흘려보낸다 (4xx·5xx는 각 도메인이 처리)
// - 브라우저 환경에서만 (SSR·노드 테스트 환경 제외)
// - /auth/* (로그인·회원가입 등)의 401은 폼에서 인라인 처리하므로 제외
// - 이미 /login이면 리다이렉트 루프 방지
export function shouldRedirectToLogin(error: AxiosError<ErrorBody>): boolean {
  if (error.response?.status !== 401) return false;
  if (error.response?.data?.code === 'INVALID_CREDENTIALS') return false;
  if (typeof window === 'undefined') return false;
  if (/(^|\/)auth\//.test(error.config?.url ?? '')) return false;
  return window.location.pathname !== '/login';
}

instance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorBody>) => {
    // 실패한 페이지를 history에 남기지 않도록 replace로 이동
    if (shouldRedirectToLogin(error)) window.location.replace('/login');
    return Promise.reject(toApiError(error));
  },
);

export default instance;
export { instance };
