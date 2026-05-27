'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';

import IconButton from '@/src/components/common/buttons/IconButton';
import { IcMeetballs } from '@/src/components/common/icons/IcMeetballs';
import { IcProfileYellow } from '@/src/components/common/icons/IcProfileYellow';
import CommentSection from '@/src/components/post/CommentSection';
import { useComments } from '@/src/hooks/comment';
import { usePost } from '@/src/hooks/post';
import { useMe } from '@/src/hooks/user';

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const id = Number(postId);

  const { data: post, isPending: postPending } = usePost(id);
  const { data: commentsData } = useComments(id);
  const { data: me } = useMe();

  const comments = commentsData?.comments ?? [];

  if (postPending || !post) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="mx-auto max-w-3xl rounded-lg bg-white p-4 shadow-sm md:p-10">
          <p className="text-sm text-slate-400">불러오는 중…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <article className="mx-auto max-w-3xl rounded-lg bg-white p-4 shadow-sm md:p-10">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h1 className="text-lg font-bold text-slate-900 md:text-2xl">{post.title}</h1>
          {/*
            TODO: 공통 Dropdown 컴포넌트 머지 후 그것으로 교체.
            메뉴 옵션: "수정하기" / "삭제하기". 현재는 placeholder 트리거만 렌더 (클릭 동작 없음).
          */}
          <IconButton aria-label="더보기" className="shrink-0">
            <IcMeetballs className="size-5 text-slate-400" />
          </IconButton>
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

        <CommentSection comments={comments} currentUserId={me?.id} />
      </article>
    </main>
  );
}
