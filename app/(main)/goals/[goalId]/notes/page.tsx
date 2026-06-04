import { notFound } from 'next/navigation';

import NotesCollection from '@/src/components/note/NotesCollection';

export default async function NotesPage({ params }: { params: Promise<{ goalId: string }> }) {
  const { goalId } = await params;
  const id = Number(goalId);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <NotesCollection goalId={id} />;
}
