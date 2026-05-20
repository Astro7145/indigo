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
  })}

export function useUpdateMe() {
  const qc = useQueryClient()
  return useMutation<UserProfile, ApiError, UpdateMeBody>({
    mutationFn: (body) => patchMe(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.me() })
    },
  })
}

export function useDeleteMe() {
  const qc = useQueryClient()
  return useMutation<void, ApiError, void>({
    mutationFn: () => deleteMe(),
    onSuccess: () => {
      qc.clear()
    },
  })
}

export function useChangePassword() {
  return useMutation<MessageResponse, ApiError, ChangePasswordBody>({
    mutationFn: (body) => changePassword(body),
  })
}
