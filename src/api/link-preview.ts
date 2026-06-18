import instance from '@/src/api/client-fetcher';
import type { LinkPreview } from '@/src/types/note';

export const linkPreviewKeys = {
  all: ['link-preview'] as const,
  detail: (url: string) => [...linkPreviewKeys.all, url] as const,
};

export async function getLinkPreview(url: string): Promise<LinkPreview> {
  const { data } = await instance.get<LinkPreview>('/link-preview', { params: { url } });
  return data;
}
