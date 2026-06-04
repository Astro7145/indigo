import axios from 'axios';
import instance from '@/src/api/client-fetcher';
import type { UploadUrlBody, UploadUrlResponse } from '@/src/types/upload';

export async function createImageUploadUrl(body: UploadUrlBody): Promise<UploadUrlResponse> {
  const { data } = await instance.post<UploadUrlResponse>('/images', body);
  return data;
}

export async function createFileUploadUrl(body: UploadUrlBody): Promise<UploadUrlResponse> {
  const { data } = await instance.post<UploadUrlResponse>('/files', body);
  return data;
}

export async function uploadImageToS3(uploadUrl: string, file: File): Promise<void> {
  await axios.put(uploadUrl, file, {
    headers: { 'Content-Type': file.type },
  });
}
