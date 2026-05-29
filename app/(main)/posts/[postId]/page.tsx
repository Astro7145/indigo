'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

import IconButton from '@/src/components/common/buttons/IconButton';
import Dropdown from '@/src/components/common/dropdown/Dropdown';
import { IcMeetballs } from '@/src/components/common/icons/IcMeetballs';
import { IcProfileYellow } from '@/src/components/common/icons/IcProfileYellow';
import CommentSection from '@/src/components/post/CommentSection';
import { useComments } from '@/src/hooks/comment';
import { useDeletePost, usePost } from '@/src/hooks/post';
import { useMe } from '@/src/hooks/user';

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const router = useRouter();
  const id = Number(postId);

  const { data: post, isPending: postPending } = usePost(id);
  const { data: commentsData } = useComments(id);
  const { data: me } = useMe();
  const { mutate: deletePost } = useDeletePost();

  const comments = commentsData?.comments ?? [];

  const handleDelete = () => {
    deletePost(id, { onSuccess: () => router.push('/posts') });
  };

  if (postPending || !post) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-104px)] w-full max-w-[343px] items-center justify-center rounded-lg bg-white p-4 shadow-sm md:max-w-[636px] md:p-10 xl:max-w-[768px]">
        <p className="text-sm text-slate-400">불러오는 중…</p>
      </div>
    );
  }

  return (
    <article className="mx-auto min-h-[calc(100vh-104px)] w-full max-w-[343px] rounded-lg bg-white p-4 shadow-sm md:max-w-[636px] md:p-10 xl:max-w-[768px]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <h1 className="text-lg font-bold text-slate-900 md:text-2xl">{post.title}</h1>
        <Dropdown className="shrink-0">
          <Dropdown.Trigger asChild>
            <IconButton aria-label="더보기">
              <IcMeetballs className="size-5 text-slate-400" />
            </IconButton>
          </Dropdown.Trigger>
          <Dropdown.Menu placement="bottom-end" size="small">
            {/* 수정 페이지(/posts/[id]/edit)는 별도 작업 — 라우트 생성 후 연결 */}
            <Dropdown.Item onClick={() => router.push(`/posts/${id}/edit`)}>수정하기</Dropdown.Item>
            <Dropdown.Item onClick={handleDelete} className="text-destructive">
              삭제하기
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {/* 작성자 */}
      <div className="mb-6 flex items-center gap-2 border-b border-slate-200 pb-4">
        <IcProfileYellow className="size-5 md:size-6" />
        <span className="text-sm text-slate-700">{post.writer.name}</span>
      </div>

      {/* 본문 — 에디터 HTML을 그대로 렌더 */}
      <div
        className="mb-6 text-sm text-slate-800 md:text-base [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* 이미지 */}
      {post.image && (
        <div className="relative mb-6 h-48 w-full max-w-sm">
          <Image src={post.image} alt="" fill className="rounded object-cover" />
        </div>
      )}

      {/* 메타 */}
      <div className="mb-8 text-xs text-slate-500">
        {post.createdAt.slice(0, 10).replace(/-/g, '.')} · 조회 {post.viewCount}
      </div>

      <CommentSection postId={id} comments={comments} currentUserId={me?.id} />
    </article>
  );
}
