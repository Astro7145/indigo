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

export interface LogoutResponse {
  message: string
}

export type OAuthProvider = 'google' | 'kakao'

export interface OAuthBody {
  token: string
}
