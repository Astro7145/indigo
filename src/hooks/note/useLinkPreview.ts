import { useQuery } from '@tanstack/react-query';
import { linkPreviewKeys, getLinkPreview } from '@/src/api/link-preview';
import type { LinkPreview } from '@/src/types/note';
import type { ApiError } from '@/src/types/common';

export function useLinkPreview(url: string | null) {
  return useQuery<LinkPreview, ApiError>({
    queryKey: linkPreviewKeys.detail(url ?? ''),
    queryFn: () => getLinkPreview(url as string),
    enabled: !!url,
    staleTime: Infinity, // 같은 URL의 메타데이터는 세션 내에서 바뀌지 않는다고 가정
  });
}
