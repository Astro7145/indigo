import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  userKeys,
  checkNickname,
  getMe,
  patchMe,
  deleteMe,
  changePassword,
} from '@/src/api/user'
import type {
  UserProfile,
  CheckNicknameResponse,
  UpdateMeBody,
  ChangePasswordBody,
} from '@/src/types/user'
import type { ApiError, MessageResponse } from '@/src/types/common'

export function useMe() {
  return useQuery<UserProfile, ApiError>({
    queryKey: userKeys.me(),
    queryFn: getMe,
  })
}

export function useCheckNickname(name: string) {
  const trimmedName = name.trim()
  return useQuery<CheckNicknameResponse, ApiError>({
    queryKey: userKeys.nickname(trimmedName),
    queryFn: () => checkNickname(trimmedName),
    enabled: trimmedName.length >= 1,
  })
}

export function useUpdateMe() {
  const qc = useQueryClient()
  return useMutation<UserProfile, ApiError, UpdateMeBody>({
    mutationFn: (body) => patchMe(body),
    // PATCH 응답이 GET과 동일한 UserProfile이므로 me 캐시 직접 갱신 (refetch 불필요).
    onSuccess: (data) => {
      qc.setQueryData(userKeys.me(), data)
    },
  })
}

export function useDeleteMe() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, void>({
    mutationFn: () => deleteMe(),
    // 탈퇴 요청이 실패해도 클라이언트 캐시는 비우는 게 안전 (계정 잔재 데이터 노출 방지).
    onSettled: () => {
      qc.clear()
    },
  })
}

export function useChangePassword() {
  return useMutation<MessageResponse, ApiError, ChangePasswordBody>({
    mutationFn: (body) => changePassword(body),
  })
}
