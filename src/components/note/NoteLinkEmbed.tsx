import { cn } from '@/src/utils/cn';

export interface NoteLinkEmbedProps {
  url: string;
  className?: string;
}

/**
 * 첨부 링크의 외부 콘텐츠를 iframe으로 임베드한다. 대부분의 사이트가 X-Frame-Options/CSP로
 * 프레이밍을 차단하므로(감지는 불가) 헤더에 "새 탭에서 열기"를 항상 제공해 폴백을 보장한다.
 */
export default function NoteLinkEmbed({ url, className }: NoteLinkEmbedProps) {
  return (
    <div className={cn('flex h-full min-h-0 flex-col', className)}>
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-3 py-2">
        <span className="min-w-0 truncate text-xs text-slate-500">{url}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs font-medium text-indigo-600 underline"
        >
          새 탭에서 열기
        </a>
      </div>
      <iframe
        src={url}
        title="첨부 링크 미리보기"
        className="min-h-0 flex-1 border-0"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </div>
  );
}
