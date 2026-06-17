'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import DOMPurify from 'isomorphic-dompurify';
import { useTranslations } from 'next-intl';

import AsyncBoundary from '@/src/components/common/AsyncBoundary';
import IconButton from '@/src/components/common/buttons/IconButton';
import Dropdown from '@/src/components/common/dropdown/Dropdown';
import { IcMeetballs } from '@/src/components/common/icons/IcMeetballs';
import { IcProfileYellow } from '@/src/components/common/icons/IcProfileYellow';
import Modal from '@/src/components/common/modal/Modal';
import CommentSection from '@/src/components/post/CommentSection';
import { useInfiniteComments } from '@/src/hooks/comment';
import { useDeletePost, usePostSuspense } from '@/src/hooks/post';
import { useToast } from '@/src/hooks/useToast';
import { useImageLightbox } from '@/src/hooks/useImageLightbox';
import { useMe } from '@/src/hooks/user';

interface PostDetailViewProps {
  postId: number;
}

export default function PostDetailView({ postId }: PostDetailViewProps) {
  const tCommon = useTranslations('common');
  const t = useTranslations('posts');

  return (
    <AsyncBoundary
      fallback={
        <div className="mx-2 flex min-h-full items-center justify-center rounded bg-white p-3 shadow-sm sm:mx-4 sm:p-6 xl:mx-auto xl:max-w-[768px] xl:p-14">
          <p className="text-sm text-slate-400">{tCommon('state.loading')}</p>
        </div>
      }
      errorFallback={
        <div className="mx-2 flex min-h-full items-center justify-center rounded bg-white p-3 shadow-sm sm:mx-4 sm:p-6 xl:mx-auto xl:max-w-[768px] xl:p-14">
          <p className="text-sm text-slate-500">{t('loadError')}</p>
        </div>
      }
    >
      <PostDetailContent postId={postId} />
    </AsyncBoundary>
  );
}

function PostDetailContent({ postId }: PostDetailViewProps) {
  const router = useRouter();
  const t = useTranslations('posts');
  const tCommon = useTranslations('common');

  const { data: post } = usePostSuspense(postId);
  // parentId='null'(문자열)을 명시해 최상위 댓글만 받는다. 자식 댓글은 각 CommentItem이 lazy로 별도 페치
  const {
    data: commentsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteComments(postId, { parentId: 'null' });
  const { data: me } = useMe();
  const { mutate: deletePost } = useDeletePost();
  const { showToast } = useToast();
  const openImageLightbox = useImageLightbox();
  const [deleteOpen, setDeleteOpen] = useState(false);

  // 받아둔 모든 페이지의 댓글을 합쳐 작성순(asc)으로 정렬. 페이지 안에서만 정렬하면 경계 어긋남
  const comments = commentsData.pages.flatMap((p) => p.comments).sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const handleDelete = () => {
    deletePost(postId, {
      onSuccess: () => router.push('/posts'),
      onError: () => showToast(t('detail.deleteError'), 'error'),
    });
  };

  return (
    <>
      <article className="mx-2 min-h-full rounded bg-white p-3 shadow-sm sm:mx-4 sm:p-6 xl:mx-auto xl:max-w-[768px] xl:p-14">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h1 className="text-lg font-bold text-slate-900 sm:text-2xl">{post.title}</h1>
          {me?.id === post.writer.id && (
            <Dropdown className="shrink-0">
              <Dropdown.Trigger asChild>
                <IconButton aria-label={tCommon('actions.more')}>
                  <IcMeetballs className="size-5 text-slate-400" />
                </IconButton>
              </Dropdown.Trigger>
              <Dropdown.Menu placement="bottom-end" size="small">
                <Dropdown.Item onClick={() => router.push(`/posts/${postId}/edit`)}>
                  {tCommon('actions.edit')}
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setDeleteOpen(true)} className="text-destructive">
                  {tCommon('actions.delete')}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>

        {/* 작성자 */}
        <div className="mb-6 flex items-center gap-2 border-b border-slate-200 pb-4">
          {post.writer.image ? (
            <Image
              src={post.writer.image}
              alt=""
              width={24}
              height={24}
              className="size-6 shrink-0 rounded-full object-cover"
            />
          ) : (
            <IcProfileYellow className="size-5 sm:size-6" />
          )}
          <span className="text-sm text-slate-700">{post.writer.name}</span>
        </div>

        {/* 본문 — isomorphic-dompurify로 서버·클라이언트 모두 sanitize */}
        <div
          className="mb-6 text-sm text-slate-800 sm:text-base [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />

        {/* 이미지 — 클릭 시 라이트박스로 확대 */}
        {post.image && (
          <button
            type="button"
            onClick={() => openImageLightbox(post.image!, post.title)}
            aria-label="첨부 이미지 확대 보기"
            className="relative mb-6 block size-[150px] cursor-pointer overflow-hidden rounded border border-slate-200 sm:size-[232px]"
          >
            <Image src={post.image} alt="" fill className="object-cover" />
          </button>
        )}

        {/* 메타 */}
        <div className="mb-8 text-xs text-slate-500">
          {post.createdAt.slice(0, 10).replace(/-/g, '.')} · {t('viewCount', { count: post.viewCount })}
        </div>

        <CommentSection
          postId={postId}
          comments={comments}
          totalCount={post.commentCount}
          currentUserId={me?.id}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      </article>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <div className="mb-6 text-center sm:mb-10">
          <Modal.Title>{t('detail.deleteTitle')}</Modal.Title>
        </div>
        <Modal.Actions>
          <Modal.Cancel>{tCommon('actions.cancel')}</Modal.Cancel>
          <Modal.Confirm onClick={handleDelete}>{tCommon('actions.delete')}</Modal.Confirm>
        </Modal.Actions>
      </Modal>
    </>
  );
}
