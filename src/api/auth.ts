import instance from '@/src/api/axiosInstance';
import type { LoginResult, SignupBody, LoginBody, OAuthProvider, OAuthBody } from '@/src/types/auth';

export const authKeys = {
  all: ['auth'] as const,
};

export async function signup(body: SignupBody): Promise<LoginResult> {
  const { data } = await instance.post<LoginResult>('/iauth/signup', body);
  return data;
}

export async function login(body: LoginBody): Promise<LoginResult> {
  const { data } = await instance.post<LoginResult>('/iauth/login', body);
  return data;
}

export async function refresh(): Promise<void> {
  await instance.post('/iauth/refresh');
}

export async function logout(): Promise<void> {
  await instance.post('/iauth/logout');
}

export async function oauthLogin(provider: OAuthProvider, body: OAuthBody): Promise<LoginResult> {
  const { data } = await instance.post<LoginResult>(`/oauth/${provider}`, body);
  return data;
}
