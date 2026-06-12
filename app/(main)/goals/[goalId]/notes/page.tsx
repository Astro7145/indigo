import { notFound } from 'next/navigation';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { prefetchInfiniteNotes } from '@/src/api/server/prefetch';
import { getQueryClient } from '@/src/api/server/query-client';
import NotesCollection from '@/src/components/note/NotesCollection';

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
