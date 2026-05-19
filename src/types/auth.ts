export interface AuthUser {
  id: number
  email: string
  name: string
  image: string | null
}

export interface LoginResult {
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

export type OAuthProvider = 'google' | 'kakao'

export interface OAuthBody {
  token: string
}
