import PostForm from '@/src/components/post/PostForm';

export default async function Page({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  return <PostForm mode="edit" postId={Number(postId)} />;
}
