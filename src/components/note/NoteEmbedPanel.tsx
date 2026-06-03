'use client';

import IconButton from '@/src/components/common/buttons/IconButton';
import { IcChevron } from '@/src/components/common/icons/IcChevron';
import { IcDelete } from '@/src/components/common/icons/IcDelete';
import { cn } from '@/src/utils/cn';

export type EmbedData =
  | { type: 'iframe'; url: string }
  | { type: 'metadata'; url: string; ogImage?: string; title?: string; description?: string };

export interface NoteEmbedPanelProps {
  open: boolean;
  onClose: () => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
  data?: EmbedData;
}

export default function NoteEmbedPanel({ open, onClose, expanded = false, onToggleExpand, data }: NoteEmbedPanelProps) {
  // 모바일/태블릿 (xl 미만): fixed bottom drawer로 에디터 위에 오버레이.
  // 데스크탑 (xl+): 부모 flex 컨테이너의 자식으로 inline, 에디터와 side-by-side로 reflow.
  // 모바일 transform 슬라이드 애니메이션을 위해 항상 렌더하되, 데스크탑 닫힘 상태는 xl:hidden으로 flex flow에서 제외.
  return (
    <aside
      aria-hidden={!open}
      aria-label="링크 임베드 패널"
      className={cn(
        'fixed inset-x-0 bottom-0 bg-white shadow-xl transition-transform duration-300',
        expanded ? 'z-[60] h-[100dvh]' : 'z-30 h-[60vh]',
        open ? 'translate-y-0' : 'translate-y-full',
        'xl:shrink-0 xl:translate-y-0',
        expanded
          ? 'xl:fixed xl:inset-0 xl:z-[60] xl:h-screen xl:w-screen'
          : 'xl:relative xl:inset-auto xl:z-auto xl:h-full xl:w-[734px]',
        open ? '' : 'xl:hidden',
      )}
    >
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <IconButton aria-label={expanded ? '패널 축소' : '패널 확장'} onClick={onToggleExpand}>
          <IcChevron className={expanded ? '-rotate-90 xl:rotate-180' : 'rotate-90 xl:rotate-0'} />
        </IconButton>
        <IconButton aria-label="패널 닫기" onClick={onClose}>
          <IcDelete />
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
