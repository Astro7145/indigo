import axios from 'axios';
import instance from '@/src/api/client-fetcher';
import type { UserProfile, CheckNicknameResponse, UpdateMeBody, ChangePasswordBody } from '@/src/types/user';
import type { MessageResponse } from '@/src/types/common';

export const userKeys = {
  all: ['user'] as const,
  me: () => [...userKeys.all, 'me'] as const,
  nickname: (name: string) => [...userKeys.all, 'nickname', name] as const,
};

// check-nickname은 인가가 필요 없는 엔드포인트라 BFF(/api)를 거치지 않고 외부 백엔드를 직접 호출한다.
// BFF를 거치면 미인증 상태(회원가입 중)에서 401 → 로그인 리다이렉트로 막힌다 (#128).
// 직접 호출에 필요한 base URL·teamId는 NEXT_PUBLIC_ env로 주입한다.
export async function checkNickname(name: string): Promise<CheckNicknameResponse> {
  const base = process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL;
  const teamId = process.env.NEXT_PUBLIC_BACKEND_TEAM_ID;
  const { data } = await axios.get<CheckNicknameResponse>(`${base}/${teamId}/users/check-nickname`, {
    params: { name },
  });
  return data;
}

export async function getMe(): Promise<UserProfile> {
  const { data } = await instance.get<UserProfile>('/users/me');
  return data;
}

export async function patchMe(body: UpdateMeBody): Promise<UserProfile> {
  const { data } = await instance.patch<UserProfile>('/users/me', body);
  return data;
}

export async function deleteMe(): Promise<void> {
  await instance.delete('/users/me');
}

export async function changePassword(body: ChangePasswordBody): Promise<MessageResponse> {
  const { data } = await instance.patch<MessageResponse>('/users/me/password', body);
  return data;
}
