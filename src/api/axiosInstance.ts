import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios'
import { getAccessToken, refreshAccessToken } from '@/src/api/authSeam'
import { ApiError } from '@/src/types/common'

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
if (!baseURL) {
  throw new Error(
    'NEXT_PUBLIC_API_BASE_URL is not set. It must include the teamId (e.g. https://slid-to-do-api.vercel.app/<teamId>).',
  )
}

type RetryableConfig = InternalAxiosRequestConfig & { __isRetry?: boolean }

const instance: AxiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

instance.interceptors.request.use(async (config) => {
  const token = await getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    // getAccessToken()을 인증의 단일 출처로 강제: 토큰이 없으면
    // (재시도 config 스프레드 등으로) 남아 있을 수 있는 만료 토큰 헤더를 제거한다.
    config.headers.delete('Authorization')
  }
  return config
})

function toApiError(error: AxiosError): ApiError {
  const res = error.response
  if (!res) {
    return new ApiError({ status: 0, message: error.message || 'Network Error' })
  }
  const data = res.data as { message?: string; code?: string } | undefined
  return new ApiError({
    status: res.status,
    code: data?.code,
    message: data?.message ?? error.message,
    details: res.data,
  })
}

let refreshPromise: Promise<void> | null = null

instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined
    const status = error.response?.status

    if (status === 401 && config && !config.__isRetry) {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null
        })
      }
      try {
        await refreshPromise
      } catch {
        // 시임 미연동(NotImplementedError 포함) 또는 refresh 실패 → 원래 401을 ApiError로 전파
        return Promise.reject(toApiError(error))
      }
      return instance.request({ ...config, __isRetry: true } as RetryableConfig)
    }

    return Promise.reject(toApiError(error))
  },
)

export default instance
export { instance }
