import { useSuspenseQuery } from '@tanstack/react-query';
import { linkPreviewKeys, getLinkPreview } from '@/src/api/link-preview';
import type { LinkPreview } from '@/src/types/note';

// url이 있을 때만 마운트되는 자식(NoteLinkPreview)에서 호출한다 — 그래서 enabled 분기가 필요 없다.
export function useLinkPreviewSuspense(url: string) {
  return useSuspenseQuery<LinkPreview>({
    queryKey: linkPreviewKeys.detail(url),
    queryFn: () => getLinkPreview(url),
    staleTime: Infinity, // 같은 URL의 메타데이터는 세션 내에서 바뀌지 않는다고 가정
  });
}
