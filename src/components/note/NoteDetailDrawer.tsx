'use client';

import { useTranslations } from 'next-intl';
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
  const t = useTranslations('goals');
  const tc = useTranslations('common');
  const router = useRouter();
  const close = () => router.back();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.back();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [router]);

  // 드로어가 열린 동안 배경 문서 스크롤을 잠근다(Modal과 동일 패턴). 인터셉트 시에만 마운트되므로 마운트=열림.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" aria-hidden onClick={close} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('note.drawerLabel')}
        className={cn('absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-2xl xl:w-[60%]')}
      >
        <IconButton aria-label={tc('actions.close')} onClick={close} className="absolute top-4 right-4 z-10">
          <IcDelete aria-hidden="true" className="size-6" />
        </IconButton>
        <NoteDetail noteId={noteId} className="h-full" />
      </div>
    </div>
  );
}
