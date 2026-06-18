import { notFound } from 'next/navigation';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { prefetchPostEdit } from '@/src/api/server/prefetch';
import { getQueryClient } from '@/src/api/server/query-client';
import PostForm from '@/src/components/post/PostForm';

export default async function Page({ params }: { params: Promise<{ postId: string }> }) {
  const { postId: raw } = await params;
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const qc = getQueryClient();
  await prefetchPostEdit(qc, id);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <PostForm mode="edit" postId={id} />
    </HydrationBoundary>
  );
}
