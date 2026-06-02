'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import IconButton from '@/src/components/common/buttons/IconButton';
import { IcDelete } from '@/src/components/common/icons';
import { cn } from '@/src/utils/cn';

import NoteDetail from './NoteDetail';

export interface NoteDetailDrawerProps {
  noteId: number;
}

/** 리스트 위에 우측에서 슬라이드되는 노트 상세 드로어. 닫기/백드롭/Escape는 router.back으로 리스트 복귀. */
export default function NoteDetailDrawer({ noteId }: NoteDetailDrawerProps) {
  const router = useRouter();
  const close = () => router.back();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.back();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [router]);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" aria-hidden onClick={close} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="노트 상세"
        className={cn('absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-2xl xl:w-[60%]')}
      >
        <IconButton aria-label="닫기" onClick={close} className="absolute top-4 right-4 z-10">
          <IcDelete aria-hidden="true" className="size-6" />
        </IconButton>
        <NoteDetail noteId={noteId} className="h-full" />
      </div>
    </div>
  );
}
