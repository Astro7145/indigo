import axios, { AxiosError, type AxiosInstance } from 'axios';
import { ApiError, ErrorBody } from '@/src/types/common';

// 클라이언트는 BFF 동일 오리진 프록시 `/api`만 호출한다 (상수 — 환경별로 변하지 않음).
// 외부 백엔드 주소·teamId는 서버 전용 env(BACKEND_*)로만 주입되며 클라이언트에 노출되지 않는다.
const instance: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
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

// client-fetcher는 브라우저 전용이다 (baseURL '/api'는 동일 오리진 상대경로 → Node엔 origin이 없다).
// SSR 중 prefetch 누락/실패로 Node에서 실행되면, 상대 baseURL이 우연히 던지는 "Invalid URL"에
// 기대지 않고 여기서 명시적으로 거부한다. reject 자체는 동일하게 Suspense 경계를 클라 렌더로
// 폴백시켜 BFF 재요청을 유도하므로 동작은 그대로다 — 서버 데이터는 serverGet로 prefetch해야 한다.
instance.interceptors.request.use((config) => {
  // throw 대신 Promise.reject로 거부한다 — 인터셉터에 synchronous 옵션이 켜지거나 axios 내부 동작이
  // 바뀌어도 동기 예외가 아닌 항상 거부된 프로미스를 반환해 .catch/.rejects 계약을 일관되게 지킨다.
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('client-fetcher must not be used on the server (SSR must prefetch via serverGet)'));
  }
  return config;
});

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
