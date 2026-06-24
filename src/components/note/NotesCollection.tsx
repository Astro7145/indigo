'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import AsyncBoundary from '@/src/components/common/AsyncBoundary';
import Dropdown from '@/src/components/common/dropdown/Dropdown';
import SearchInput from '@/src/components/common/inputs/SearchInput';
import { IcFilter } from '@/src/components/common/icons/IcFilter';
import { IcGoal } from '@/src/components/common/icons/IcGoal';
import NoteCard from '@/src/components/note/NoteCard';
import NoteDeleteConfirm from '@/src/components/note/NoteDeleteConfirm';
import { useGoal } from '@/src/hooks/goal';
import { useInfiniteNoteList } from '@/src/hooks/note/note';
import { useNoteDrawer } from '@/src/hooks/note/useNoteDrawer';
import { useModalStore } from '@/src/stores/modal';
import type { Note } from '@/src/types/note';
import { cn } from '@/src/utils/cn';

type Sort = 'latest' | 'oldest';

export interface NotesCollectionProps {
  goalId: number;
  className?: string;
}

/** 목표별 노트 모아보기 리스트 본문. 목표 헤더 + 검색/정렬 + 2열 노트 카드 그리드 + 무한 스크롤. */
export default function NotesCollection({ goalId, className }: NotesCollectionProps) {
  const t = useTranslations('note');
  const { data: goal } = useGoal(goalId);

  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<Sort>('latest');

  // 입력 디바운스(300ms) → 검색어
  useEffect(() => {
    const t = setTimeout(() => setSearch(input.trim()), 300);
    return () => clearTimeout(t);
  }, [input]);

  return (
    <div className={cn('mx-auto flex w-full max-w-[1312px] flex-col gap-3 sm:gap-4 xl:gap-5', className)}>
      <div className="flex h-12 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="hidden text-2xl font-semibold text-slate-800 sm:block dark:text-white">
          {t('collection.title')}
        </h1>
        <div className="flex items-center justify-between">
          <div className="w-full sm:w-[320px]">
            <SearchInput
              placeholder={t('collection.searchPlaceholder')}
              aria-label={t('collection.searchLabel')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <Dropdown className="flex w-30 shrink-0 justify-end">
            <Dropdown.Trigger asChild>
              <button
                type="button"
                className="flex shrink-0 items-center gap-1 text-sm whitespace-nowrap text-slate-600 dark:text-white/70"
              >
                {t(`collection.sort.${sort}`)}
                <IcFilter aria-hidden className="size-5 dark:text-white/70" />
              </button>
            </Dropdown.Trigger>
            <Dropdown.Menu size="small" placement="bottom-end">
              <Dropdown.Item onClick={() => setSort('latest')}>{t('collection.sort.latest')}</Dropdown.Item>
              <Dropdown.Item onClick={() => setSort('oldest')}>{t('collection.sort.oldest')}</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      <div className="dark:bg-indigo-dark-300 flex items-center gap-3 rounded bg-indigo-100 px-6 py-5 xl:gap-6 xl:px-10 xl:py-10">
        <IcGoal aria-hidden className="size-10 shrink-0" />
        <h2 className="min-w-0 truncate text-base font-semibold text-slate-800 sm:text-xl xl:text-2xl dark:text-white">
          {goal?.title ?? ''}
        </h2>
      </div>

      <AsyncBoundary
        fallback={
          <p className="py-16 text-center text-sm text-slate-400 dark:text-white/60">{t('collection.loading')}</p>
        }
        errorFallback={
          <p className="py-16 text-center text-sm text-slate-400 dark:text-white/60">{t('collection.loadError')}</p>
        }
        resetKeys={[search, sort]}
      >
        <NotesCollectionContent goalId={goalId} search={search} sort={sort} />
      </AsyncBoundary>
    </div>
  );
}

function NotesCollectionContent({ goalId, search, sort }: { goalId: number; search: string; sort: Sort }) {
  const t = useTranslations('note');
  const tCommon = useTranslations('common');
  const { openNote } = useNoteDrawer();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError } = useInfiniteNoteList({
    goalId,
    search: search || undefined,
    sort,
  });

  const notes = data.pages.flatMap((p) => p.notes);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 삭제 확인은 전역 모달 스택(ModalStack)에 띄운다 — note 도메인의 다른 다이얼로그와 동일.
  const openDeleteConfirm = (note: Note) =>
    useModalStore.getState().open((controls) => <NoteDeleteConfirm note={note} onClose={controls.close} />, {
      variant: 'modal',
    });

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage || isFetchingNextPage || isFetchNextPageError) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextPage();
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage, notes.length]);

  if (notes.length === 0) {
    return <p className="py-16 text-center text-sm text-slate-500 dark:text-white/60">{t('collection.empty')}</p>;
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-3 sm:gap-4 xl:grid-cols-2 xl:gap-6">
        {notes.map((n) => (
          <li key={n.id}>
            <NoteCard
              note={n}
              onClick={() => openNote(n.todoId, 'detail')}
              menu={
                <Dropdown.Menu size="small" placement="bottom-end">
                  <Dropdown.Item onClick={() => openNote(n.todoId, 'edit')}>{tCommon('actions.edit')}</Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => openDeleteConfirm(n)}
                    className="text-destructive dark:text-destructive"
                  >
                    {tCommon('actions.delete')}
                  </Dropdown.Item>
                </Dropdown.Menu>
              }
            />
          </li>
        ))}
      </ul>
      {hasNextPage && <div ref={sentinelRef} aria-hidden className="h-1" />}
      {isFetchingNextPage && (
        <p className="py-3 text-center text-sm text-slate-400 dark:text-white/60">{t('collection.loading')}</p>
      )}
    </>
  );
}
