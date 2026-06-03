import IconButton from '@/src/components/common/buttons/IconButton';
import { IcBadgeClose } from '@/src/components/common/icons/IcBadgeClose';

export interface NoteLinkCardProps {
  url: string;
  title?: string;
  faviconUrl?: string;
  onClick: () => void;
  onDelete: () => void;
}

export default function NoteLinkCard({ url, title, faviconUrl, onClick, onDelete }: NoteLinkCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-slate-50 px-3 py-2 sm:px-4 sm:py-3">
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 items-start gap-2 text-left sm:gap-3"
        aria-label="링크 미리보기 열기"
      >
        {faviconUrl ? (
          <img src={faviconUrl} alt="" className="size-5 shrink-0 rounded-sm sm:size-6" />
        ) : (
          <div className="size-5 shrink-0 rounded-sm bg-slate-200 sm:size-6" aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-slate-800 sm:text-sm">{title ?? url}</p>
          {/* URL은 좁은 폭에서 자연스럽게 줄바꿈 (Figma 모바일은 2줄 wrap) */}
          <p className="text-[11px] break-all text-slate-400 sm:text-xs">{url}</p>
        </div>
      </button>
      <IconButton aria-label="링크 삭제" onClick={onDelete} className="shrink-0">
        <IcBadgeClose />
      </IconButton>
    </div>
  );
}
