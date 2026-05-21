import instance from '@/src/api/axiosInstance';
import type { UserProfile, CheckNicknameResponse, UpdateMeBody, ChangePasswordBody } from '@/src/types/user';
import type { MessageResponse } from '@/src/types/common';

export const userKeys = {
  all: ['user'] as const,
  me: () => [...userKeys.all, 'me'] as const,
  nickname: (name: string) => [...userKeys.all, 'nickname', name] as const,
};

export async function checkNickname(name: string): Promise<CheckNicknameResponse> {
  const { data } = await instance.get<CheckNicknameResponse>('/users/check-nickname', {
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
