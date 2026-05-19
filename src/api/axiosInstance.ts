import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios'
import { getAccessToken, refreshAccessToken } from '@/src/api/authSeam'
import { ApiError, NotImplementedError } from '@/src/types/common'

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
      } catch (refreshError) {
        void (refreshError instanceof NotImplementedError)
        return Promise.reject(toApiError(error))
      }
      config.__isRetry = true
      return instance.request(config)
    }

    return Promise.reject(toApiError(error))
  },
)

export default instance
export { instance }
