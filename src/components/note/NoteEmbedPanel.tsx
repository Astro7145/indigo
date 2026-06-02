'use client';

import IconButton from '@/src/components/common/buttons/IconButton';
import { IcChevron } from '@/src/components/common/icons/IcChevron';

export type EmbedData =
  | { type: 'iframe'; url: string }
  | { type: 'metadata'; url: string; ogImage?: string; title?: string; description?: string };

export interface NoteEmbedPanelProps {
  open: boolean;
  onClose: () => void;
  data?: EmbedData;
}

export default function NoteEmbedPanel({ open, onClose, data }: NoteEmbedPanelProps) {
  return (
    <aside
      aria-hidden={!open}
      aria-label="링크 임베드 패널"
      className={`fixed top-0 right-0 z-30 h-full w-full bg-white shadow-xl transition-transform duration-300 sm:w-[420px] xl:w-[520px] ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-medium text-slate-800 sm:text-base">링크 미리보기</h2>
        <IconButton aria-label="패널 닫기" onClick={onClose}>
          <IcChevron />
        </IconButton>
      </header>

      <div className="h-[calc(100%-49px)] overflow-auto">
        {!data && (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            <p>여기에 임베드가 표시됩니다</p>
          </div>
        )}

        {data?.type === 'iframe' && (
          <iframe
            src={data.url}
            title="링크 미리보기"
            className="size-full border-0"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        )}

        {data?.type === 'metadata' && (
          <article className="flex flex-col gap-3 p-4">
            {data.ogImage && <img src={data.ogImage} alt="" className="w-full rounded-lg object-cover" />}
            {data.title && <h3 className="text-base font-semibold text-slate-800">{data.title}</h3>}
            {data.description && <p className="text-sm text-slate-600">{data.description}</p>}
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-xs text-indigo-600 underline"
            >
              {data.url}
            </a>
          </article>
        )}
      </div>
    </aside>
  );
}
