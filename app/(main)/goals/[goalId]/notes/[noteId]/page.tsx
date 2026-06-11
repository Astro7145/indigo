import { notFound } from 'next/navigation';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { prefetchNote } from '@/src/api/server/prefetch';
import { getQueryClient } from '@/src/api/server/query-client';
import NoteDetail from '@/src/components/note/NoteDetail';

/** 새로고침·직접 진입 시 렌더되는 standalone 노트 페이지(드로어 아님). */
export default async function NotePage({ params }: { params: Promise<{ noteId: string }> }) {
  const { noteId } = await params;
  const id = Number(noteId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const qc = getQueryClient();
  await prefetchNote(qc, id);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <div className="mx-auto h-full w-full max-w-[900px]">
        <NoteDetail noteId={id} className="h-full" />
      </div>
    </HydrationBoundary>
  );
}
