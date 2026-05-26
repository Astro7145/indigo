import axios, { AxiosError, type AxiosInstance } from 'axios';
import { ApiError } from '@/src/types/common';

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
  const data = res.data as { message?: string; code?: string } | undefined;
  return new ApiError({
    status: res.status,
    code: data?.code,
    message: data?.message ?? error.message,
    details: res.data,
  });
}

instance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(toApiError(error)),
);

export default instance;
export { instance };
