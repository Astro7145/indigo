import { notFound } from 'next/navigation';

import PostForm from '@/src/components/post/PostForm';

export default async function Page({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const id = Number(postId);
  // 잘못된 URL(abc, -1, 1.5 등)에서 의미 없는 fetch가 발생하지 않도록 양의 정수만 허용하고 나머지는 404로 차단
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <PostForm mode="edit" postId={id} />;
}
