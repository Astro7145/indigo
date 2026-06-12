import { notFound } from 'next/navigation';

import NoteDetail from '@/src/components/note/NoteDetail';

/** 새로고침·직접 진입 시 렌더되는 standalone 노트 페이지(드로어 아님). prefetch 범위 제외 — 구조 개편 예정인 프로토타입. */
export default async function NotePage({ params }: { params: Promise<{ noteId: string }> }) {
  const { noteId } = await params;
  const id = Number(noteId);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return (
    <div className="mx-auto h-full w-full max-w-[900px]">
      <NoteDetail noteId={id} className="h-full" />
    </div>
  );
}
