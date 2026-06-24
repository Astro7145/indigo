import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { prefetchInfiniteNotes } from '@/src/api/server/prefetch';
import { getQueryClient } from '@/src/api/server/query-client';
import NotesCollection from '@/src/components/note/NotesCollection';

// 메타데이터는 병렬 라우트 layout이 아닌 page에 둔다 — layout이 문자열 title을 가지면
// 루트 title.template이 standalone 노트 상세([noteId])까지 전파되지 못하고 끊긴다.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('goals');
  return { title: t('meta.notes.title'), description: t('meta.notes.description') };
}

export default async function NotesPage({ params }: { params: Promise<{ goalId: string }> }) {
  const { goalId } = await params;
  const id = Number(goalId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const qc = getQueryClient();
  await prefetchInfiniteNotes(qc, id);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <NotesCollection goalId={id} />
    </HydrationBoundary>
  );
}
