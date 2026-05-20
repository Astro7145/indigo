import { useMutation } from '@tanstack/react-query'
import { createImageUploadUrl, createFileUploadUrl } from '@/src/api/upload'
import type { UploadUrlBody, UploadUrlResponse } from '@/src/types/upload'
import type { ApiError } from '@/src/types/common'

export function useCreateImageUploadUrl() {
  return useMutation<UploadUrlResponse, ApiError, UploadUrlBody>({
    mutationFn: (body) => createImageUploadUrl(body),
  })
}

export function useCreateFileUploadUrl() {
  return useMutation<UploadUrlResponse, ApiError, UploadUrlBody>({
    mutationFn: (body) => createFileUploadUrl(body),
  })
}
