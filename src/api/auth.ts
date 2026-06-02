import instance from '@/src/api/client-fetcher';
import type { LoginResult, SignupBody, LoginBody } from '@/src/types/auth';

export const authKeys = {
  all: ['auth'] as const,
};

export async function signup(body: SignupBody): Promise<LoginResult> {
  const { data } = await instance.post<LoginResult>('/auth/signup', body);
  return data;
}

export async function login(body: LoginBody): Promise<LoginResult> {
  const { data } = await instance.post<LoginResult>('/auth/login', body);
  return data;
}

export async function refresh(): Promise<void> {
  await instance.post('/auth/refresh');
}

export async function logout(): Promise<void> {
  await instance.post('/auth/logout');
}
