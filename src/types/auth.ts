export interface AuthUser {
  id: number
  email: string
  name: string
  image: string | null
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export interface SignupBody {
  email: string
  name: string
  password: string
}

export interface LoginBody {
  email: string
  password: string
}

export interface RefreshBody {
  refreshToken: string
}

export interface RefreshResponse {
  accessToken: string
  refreshToken: string | null
}

export type LogoutBody = RefreshBody

import type { MessageResponse } from '@/src/types/common'
export type LogoutResponse = MessageResponse

export type OAuthProvider = 'google' | 'kakao'

export interface OAuthBody {
  token: string
}
