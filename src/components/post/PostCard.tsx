'use client';

import Image from 'next/image';

import Card from '@/src/components/common/cards/Card';
import { IcMessageCircle } from '@/src/components/common/icons/IcMessageCircle';
import { usePost } from '@/src/hooks/post';
import { cn } from '@/src/utils/cn';

export type PostCardSize = 'large' | 'small';

export interface PostCardProps {
  postId: number;
  size?: PostCardSize;
  onClick?: () => void;
  className?: string;
}

/** size별 root 클래스 — Figma 21209:64306 (large 384×250) / 21209:64322 (small 260×204) */
const sizeClasses: Record<PostCardSize, string> = {
  large: 'w-[384px] gap-4',
  small: 'w-[260px] gap-3',
};

/**
 * 게시판 카드 — `postId`로 글을 직접 조회(usePost)해 공통 Card 표면 위에 합성.
 * 라우팅·인터랙션은 `onClick`으로 호출 측 위임 (라우터 push 또는 Link 래핑 자유).
 */
export default function PostCard({ postId, size = 'large', onClick, className }: PostCardProps) {
  const { data: post, isLoading, isError } = usePost(postId);

  if (isLoading || !post) {
    return (
      <Card size={size} className={cn('flex flex-col', sizeClasses[size], className)}>
        <p className="text-sm text-slate-400">{isError ? '불러오지 못했어요' : '불러오는 중…'}</p>
      </Card>
    );
  }

  return (
    <Card size={size} className={cn('flex flex-col', sizeClasses[size], className)} onClick={onClick}>
      <h3 className="text-xl font-semibold text-slate-900">{post.title}</h3>
      {post.image && (
        <div className="relative size-[100px] overflow-hidden rounded border border-slate-200">
          <Image src={post.image} alt="게시글 이미지" fill sizes="100px" className="object-cover" />
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-base text-slate-500">
          {post.writer.image && (
            <Image src={post.writer.image} alt="" width={24} height={24} className="rounded-full" />
          )}
          <span className="flex items-center gap-1">
            <span>{post.writer.name}</span>
            <span aria-hidden>·</span>
            <span>조회 {post.viewCount}</span>
          </span>
        </div>
        <div className="flex items-center gap-0.5 text-base text-slate-600" aria-label={`댓글 ${post.commentCount}개`}>
          <IcMessageCircle className="size-4 text-slate-600" />
          <span>{post.commentCount}</span>
        </div>
      </div>
    </Card>
  );
}
