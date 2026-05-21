import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signup, login, refresh, logout, oauthLogin } from '@/src/api/auth';
import { userKeys } from '@/src/api/user';
import type { LoginResult, SignupBody, LoginBody, OAuthProvider, OAuthBody } from '@/src/types/auth';
import type { ApiError } from '@/src/types/common';

export function useSignup() {
  const qc = useQueryClient();
  return useMutation<LoginResult, ApiError, SignupBody>({
    mutationFn: (body) => signup(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation<LoginResult, ApiError, LoginBody>({
    mutationFn: (body) => login(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
}

export function useOauthLogin() {
  const qc = useQueryClient();
  return useMutation<LoginResult, ApiError, { provider: OAuthProvider; body: OAuthBody }>({
    mutationFn: ({ provider, body }) => oauthLogin(provider, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation<void, ApiError, void>({
    mutationFn: () => logout(),
    // 토큰 만료 등으로 서버 호출이 실패해도 클라이언트 세션은 종료해야 하므로 onSettled.
    onSettled: () => {
      qc.clear();
    },
  });
}

export function useRefresh() {
  return useMutation<void, ApiError, void>({
    mutationFn: () => refresh(),
  });
}
