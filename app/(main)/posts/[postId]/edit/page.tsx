import { notFound } from 'next/navigation';

import PostForm from '@/src/components/post/PostForm';

export default async function Page({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const id = Number(postId);
  // 잘못된 URL(/posts/abc/edit 등)로 NaN이 들어가면 의미 없는 fetch가 발생하므로 404로 차단
  if (!Number.isFinite(id)) notFound();
  return <PostForm mode="edit" postId={id} />;
}
