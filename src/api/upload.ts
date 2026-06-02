import axios, { AxiosError } from 'axios';
import instance from '@/src/api/client-fetcher';
import { ApiError } from '@/src/types/common';
import type { UploadUrlBody, UploadUrlResponse } from '@/src/types/upload';

export async function createImageUploadUrl(body: UploadUrlBody): Promise<UploadUrlResponse> {
  const { data } = await instance.post<UploadUrlResponse>('/images', body);
  return data;
}

export async function createFileUploadUrl(body: UploadUrlBody): Promise<UploadUrlResponse> {
  const { data } = await instance.post<UploadUrlResponse>('/files', body);
  return data;
}

// presigned URL은 외부 스토리지(S3 등)라 우리 axios instance의 baseURL/인증 인터셉터를 거치면 안 된다.
// 라이브러리 기본 axios로 직접 PUT 하고, 실패는 ApiError로 정규화해 다른 도메인 훅과 에러 타입을 통일한다.
export async function uploadToPresignedUrl(uploadUrl: string, file: File): Promise<void> {
  try {
    await axios.put(uploadUrl, file, { headers: { 'Content-Type': file.type } });
  } catch (e) {
    if (e instanceof AxiosError) {
      throw new ApiError({
        status: e.response?.status ?? 0,
        message: e.message,
      });
    }
    throw e;
  }
}
