import { notFound } from 'next/navigation';

import NoteDetailDrawer from '@/src/components/note/NoteDetailDrawer';

export default async function InterceptedNoteDetail({ params }: { params: Promise<{ noteId: string }> }) {
  const { noteId } = await params;
  const id = Number(noteId);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <NoteDetailDrawer noteId={id} />;
}
