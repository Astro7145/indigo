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
  // 모바일/태블릿(<xl): 하단 drawer (full-width, translate-y로 슬라이드 업)
  // 데스크탑(xl+): 우측 column 734px (translate-x로 슬라이드 좌측)
  const positionClass =
    'fixed inset-x-0 bottom-0 h-[60vh] xl:top-0 xl:right-0 xl:bottom-auto xl:left-auto xl:h-full xl:w-[734px]';
  const slideClass = open ? 'translate-y-0 xl:translate-x-0' : 'translate-y-full xl:translate-y-0 xl:translate-x-full';

  return (
    <aside
      aria-hidden={!open}
      aria-label="링크 임베드 패널"
      className={`z-30 bg-white shadow-xl transition-transform duration-300 ${positionClass} ${slideClass}`}
    >
      {/* 닫기 chevron — 모바일/태블릿은 상단 중앙(드래그 핸들 자리), 데스크탑은 좌측 상단(패널 안쪽) */}
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 xl:flex-row-reverse">
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
