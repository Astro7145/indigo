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
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 sm:px-4 sm:py-3">
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-2 text-left sm:gap-3"
        aria-label="링크 미리보기 열기"
      >
        {faviconUrl ? (
          <img src={faviconUrl} alt="" className="size-5 shrink-0 rounded-sm sm:size-6" />
        ) : (
          <div className="size-5 shrink-0 rounded-sm bg-slate-100 sm:size-6" aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-slate-800 sm:text-sm">{title ?? url}</p>
          <p className="truncate text-[11px] text-slate-400 sm:text-xs">{url}</p>
        </div>
      </button>
      <IconButton aria-label="링크 삭제" onClick={onDelete} className="shrink-0">
        <IcBadgeClose />
      </IconButton>
    </div>
  );
}
