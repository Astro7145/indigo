'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import DOMPurify from 'dompurify';

import IconButton from '@/src/components/common/buttons/IconButton';
import Dropdown from '@/src/components/common/dropdown/Dropdown';
import { IcMeetballs } from '@/src/components/common/icons/IcMeetballs';
import { IcProfileYellow } from '@/src/components/common/icons/IcProfileYellow';
import Modal from '@/src/components/common/modal/Modal';
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
  const [deleteOpen, setDeleteOpen] = useState(false);

  const comments = commentsData?.comments ?? [];

  const handleDelete = () => {
    deletePost(id, { onSuccess: () => router.push('/posts') });
  };

  if (postPending || !post) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-104px)] w-full max-w-[343px] items-center justify-center rounded bg-white p-4 shadow-sm md:min-h-[calc(100vh-48px)] md:max-w-[636px] md:p-10 lg:min-h-[calc(100vh-160px)] xl:max-w-[768px] xl:p-14">
        <p className="text-sm text-slate-400">불러오는 중…</p>
      </div>
    );
  }

  return (
    <>
      <article className="mx-auto min-h-[calc(100vh-104px)] w-full max-w-[343px] rounded bg-white p-4 shadow-sm md:min-h-[calc(100vh-48px)] md:max-w-[636px] md:p-10 lg:min-h-[calc(100vh-160px)] xl:max-w-[768px] xl:p-14">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h1 className="text-lg font-bold text-slate-900 md:text-2xl">{post.title}</h1>
          {me?.id === post.writer.id && (
            <Dropdown className="shrink-0">
              <Dropdown.Trigger asChild>
                <IconButton aria-label="더보기">
                  <IcMeetballs className="size-5 text-slate-400" />
                </IconButton>
              </Dropdown.Trigger>
              <Dropdown.Menu placement="bottom-end" size="small">
                {/* 수정 페이지(/posts/[id]/edit)는 별도 작업 — 라우트 생성 후 연결 */}
                <Dropdown.Item onClick={() => router.push(`/posts/${id}/edit`)}>수정하기</Dropdown.Item>
                <Dropdown.Item onClick={() => setDeleteOpen(true)} className="text-destructive">
                  삭제하기
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>

        {/* 작성자 */}
        <div className="mb-6 flex items-center gap-2 border-b border-slate-200 pb-4">
          {post.writer.image ? (
            <Image src={post.writer.image} alt="" width={24} height={24} className="shrink-0 rounded-full" />
          ) : (
            <IcProfileYellow className="size-5 md:size-6" />
          )}
          <span className="text-sm text-slate-700">{post.writer.name}</span>
        </div>

        {/* 본문 — 에디터 HTML을 그대로 렌더. SSR/빌드 시점엔 window가 없으므로 빈 문자열 */}
        <div
          className="mb-6 text-sm text-slate-800 md:text-base [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{
            __html: typeof window !== 'undefined' ? DOMPurify.sanitize(post.content) : '',
          }}
        />

        {/* 이미지 */}
        {post.image && (
          <div className="relative mb-6 size-[150px] overflow-hidden rounded border border-slate-200 md:size-[232px]">
            <Image src={post.image} alt="" fill className="object-cover" />
          </div>
        )}

        {/* 메타 */}
        <div className="mb-8 text-xs text-slate-500">
          {post.createdAt.slice(0, 10).replace(/-/g, '.')} · 조회 {post.viewCount}
        </div>

        <CommentSection postId={id} comments={comments} currentUserId={me?.id} />
      </article>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <div className="mb-6 text-center sm:mb-10">
          <Modal.Title>게시물을 삭제하시겠어요?</Modal.Title>
        </div>
        <Modal.Actions>
          <Modal.Cancel>취소</Modal.Cancel>
          <Modal.Confirm onClick={handleDelete}>삭제하기</Modal.Confirm>
        </Modal.Actions>
      </Modal>
    </>
  );
}
