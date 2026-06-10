import NoteForm from '@/src/components/note/NoteForm';

export default async function Page({ params }: { params: Promise<{ todoId: string }> }) {
  const { todoId } = await params;
  return <NoteForm mode="create" todoId={Number(todoId)} />;
}
