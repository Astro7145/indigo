import { useMutation } from '@tanstack/react-query';
import { createImageUploadUrl, createFileUploadUrl, uploadImageToS3 } from '@/src/api/upload';
import type { UploadUrlBody, UploadUrlResponse } from '@/src/types/upload';
import type { ApiError } from '@/src/types/common';

export function useCreateImageUploadUrl() {
  return useMutation<UploadUrlResponse, ApiError, UploadUrlBody>({
    mutationFn: (body) => createImageUploadUrl(body),
  });
}

export function useCreateFileUploadUrl() {
  return useMutation<UploadUrlResponse, ApiError, UploadUrlBody>({
    mutationFn: (body) => createFileUploadUrl(body),
  });
}

// S3 직접 PUT 업로드는 공용 인터셉터를 거치지 않으므로 에러가 ApiError가 아닌 AxiosError다.
export function useUploadImageToS3() {
  return useMutation<void, Error, { uploadUrl: string; file: File }>({
    mutationFn: ({ uploadUrl, file }) => uploadImageToS3(uploadUrl, file),
  });
}
