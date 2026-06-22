'use client';

import NoteLinkCard from '@/src/components/note/NoteLinkCard';
import { useLinkPreviewSuspense } from '@/src/hooks/note/useLinkPreview';

export interface NoteLinkPreviewProps {
  url: string;
  onClick: () => void;
  /** 없으면 삭제 버튼을 보이지 않는다 (읽기 모드 등) */
  onDelete?: () => void;
}

/**
 * 링크 프리뷰(title·favicon)를 Suspense로 조회해 NoteLinkCard에 채워 넣는다.
 * 로딩은 AsyncBoundary fallback(NoteLinkPreviewFallback)이, 조회 실패는 errorFallback이 담당한다.
 */
export default function NoteLinkPreview({ url, onClick, onDelete }: NoteLinkPreviewProps) {
  const { data } = useLinkPreviewSuspense(url);

  return (
    <NoteLinkCard
      url={url}
      title={data.title ?? undefined}
      faviconUrl={data.faviconUrl ?? undefined}
      onClick={onClick}
      onDelete={onDelete}
    />
  );
}

/** NoteLinkCard와 같은 형태의 로딩 스켈레톤 (파비콘 박스 + 제목/URL 줄). */
export function NoteLinkPreviewFallback() {
  return (
    <div role="status" className="flex items-start gap-3 rounded-lg bg-slate-50 px-3 py-2 sm:px-4 sm:py-3">
      <div className="size-5 shrink-0 animate-pulse rounded-sm bg-slate-200 sm:size-6" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-0.5">
        <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200 sm:h-3.5" />
        <div className="h-2.5 w-1/2 animate-pulse rounded bg-slate-200" />
      </div>
      <span className="sr-only">링크 미리보기 불러오는 중</span>
    </div>
  );
}
