import instance from '@/src/api/axiosInstance'
import type {
  AuthTokens,
  SignupBody,
  LoginBody,
  RefreshBody,
  RefreshResponse,
  LogoutBody,
  LogoutResponse,
  OAuthProvider,
  OAuthBody,
} from '@/src/types/auth'

export const authKeys = {
  all: ['auth'] as const,
}

export async function signup(body: SignupBody): Promise<AuthTokens> {
  const { data } = await instance.post<AuthTokens>('/auth/signup', body)
  return data
}

export async function login(body: LoginBody): Promise<AuthTokens> {
  const { data } = await instance.post<AuthTokens>('/auth/login', body)
  return data
}

export async function refresh(body: RefreshBody): Promise<RefreshResponse> {
  const { data } = await instance.post<RefreshResponse>('/auth/refresh', body)
  return data
}

export async function logout(body: LogoutBody): Promise<LogoutResponse> {
  const { data } = await instance.post<LogoutResponse>('/auth/logout', body)
  return data
}

export async function oauthLogin(
  provider: OAuthProvider,
  body: OAuthBody,
): Promise<AuthTokens> {
  const { data } = await instance.post<AuthTokens>(`/oauth/${provider}`, body)
  return data
}
