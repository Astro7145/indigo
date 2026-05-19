import axios, { AxiosError, type AxiosInstance } from 'axios'
import { ApiError } from '@/src/types/common'

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
if (!baseURL) {
  throw new Error(
    'NEXT_PUBLIC_API_BASE_URL is not set. Use the same-origin BFF proxy path "/api".',
  )
}

const instance: AxiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
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

instance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(toApiError(error)),
)

export default instance
export { instance }
