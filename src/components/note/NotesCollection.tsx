'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import AsyncBoundary from '@/src/components/common/AsyncBoundary';
import Dropdown from '@/src/components/common/dropdown/Dropdown';
import SearchInput from '@/src/components/common/inputs/SearchInput';
import { IcFilter } from '@/src/components/common/icons/IcFilter';
import { IcGoal } from '@/src/components/common/icons/IcGoal';
import NoteCard from '@/src/components/note/NoteCard';
import { useGoal } from '@/src/hooks/goal';
import { useInfiniteNoteList } from '@/src/hooks/note';
import { cn } from '@/src/utils/cn';

type Sort = 'latest' | 'oldest';
const SORT_LABELS: Record<Sort, string> = { latest: '최신순', oldest: '오래된순' };

export interface NotesCollectionProps {
  goalId: number;
  className?: string;
}

/** 목표별 노트 모아보기 리스트 본문. 목표 헤더 + 검색/정렬 + 2열 노트 카드 그리드 + 무한 스크롤. */
export default function NotesCollection({ goalId, className }: NotesCollectionProps) {
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
        <h1 className="hidden text-2xl font-semibold text-slate-800 sm:block">노트 모아보기</h1>
        <div className="flex items-center gap-8 sm:gap-4">
          <div className="w-full sm:w-[320px]">
            <SearchInput
              placeholder="노트를 검색해주세요"
              aria-label="노트 검색"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <Dropdown className="w-20 shrink-0">
            <Dropdown.Trigger asChild>
              <button
                type="button"
                className="flex shrink-0 items-center gap-1 text-sm whitespace-nowrap text-slate-600"
              >
                {SORT_LABELS[sort]}
                <IcFilter aria-hidden className="size-5" />
              </button>
            </Dropdown.Trigger>
            <Dropdown.Menu size="small" placement="bottom-end">
              <Dropdown.Item onClick={() => setSort('latest')}>최신순</Dropdown.Item>
              <Dropdown.Item onClick={() => setSort('oldest')}>오래된순</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded bg-indigo-100 px-6 py-5 xl:gap-6 xl:px-10 xl:py-10">
        <IcGoal aria-hidden className="size-10 shrink-0" />
        <h2 className="min-w-0 truncate text-base font-semibold text-slate-800 sm:text-xl xl:text-2xl">
          {goal?.title ?? ''}
        </h2>
      </div>

      <AsyncBoundary
        fallback={<p className="py-16 text-center text-sm text-slate-400">불러오는 중…</p>}
        errorFallback={<p className="py-16 text-center text-sm text-slate-400">불러오지 못했어요</p>}
        resetKeys={[search, sort]}
      >
        <NotesCollectionBody goalId={goalId} search={search} sort={sort} />
      </AsyncBoundary>
    </div>
  );
}

function NotesCollectionBody({ goalId, search, sort }: { goalId: number; search: string; sort: Sort }) {
  const router = useRouter();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError } = useInfiniteNoteList({
    goalId,
    search: search || undefined,
    sort,
  });

  const notes = data.pages.flatMap((p) => p.notes);
  const sentinelRef = useRef<HTMLDivElement>(null);

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

  // 노트 카드 케밥 메뉴 — 표시까지만(수정/삭제 동작·에디터 진입은 별도 작업)
  const moreMenu = (
    <Dropdown.Menu size="small" placement="bottom-end">
      <Dropdown.Item onClick={() => {}}>수정하기</Dropdown.Item>
      <Dropdown.Item onClick={() => {}} className="text-destructive">
        삭제하기
      </Dropdown.Item>
    </Dropdown.Menu>
  );

  if (notes.length === 0) {
    return <p className="py-16 text-center text-sm text-slate-500">노트가 아직 없어요</p>;
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-3 sm:gap-4 xl:grid-cols-2 xl:gap-6">
        {notes.map((n) => (
          <li key={n.id}>
            <NoteCard
              noteId={n.id}
              note={n}
              onClick={() => router.push(`/goals/${goalId}/notes/${n.id}`)}
              menu={moreMenu}
            />
          </li>
        ))}
      </ul>
      {hasNextPage && <div ref={sentinelRef} aria-hidden className="h-1" />}
      {isFetchingNextPage && <p className="py-3 text-center text-sm text-slate-400">불러오는 중…</p>}
    </>
  );
}
