import NotePage from '@/src/components/note/todo-note/NotePage';

export default async function Page({ params }: { params: Promise<{ todoId: string }> }) {
  const { todoId } = await params;
  return <NotePage todoId={Number(todoId)} />;
}
