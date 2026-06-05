'use client';

import Image from 'next/image';

import Card from '@/src/components/common/cards/Card';
import { IcMessageCircle } from '@/src/components/common/icons/IcMessageCircle';
import { IcProfileYellow } from '@/src/components/common/icons/IcProfileYellow';
import type { Post } from '@/src/types/post';
import { cn } from '@/src/utils/cn';
import { stripHtml } from '@/src/utils/stripHtml';

export interface PostCardProps {
  post: Post;
  onClick?: () => void;
  className?: string;
}

// 스켈레톤이 동일 외곽을 재사용하도록 export — 카드가 채워질 영역의 크기 점프(layout shift) 방지.
export const postCardRootClass =
  'flex shrink-0 flex-col w-[260px] h-[204px] p-3 gap-3 overflow-hidden sm:h-[280px] sm:w-[384px] sm:p-8 sm:gap-4 xl:w-full';

export default function PostCard({ post, onClick, className }: PostCardProps) {
  return (
    <Card className={cn(postCardRootClass, className)} onClick={onClick}>
      <h3 className="line-clamp-2 text-xl font-semibold text-slate-900">{post.title}</h3>
      {post.image ? (
        <div className="flex items-center gap-3">
          <Image
            src={post.image}
            alt=""
            width={100}
            height={100}
            className="size-[100px] shrink-0 rounded border border-slate-200 object-cover"
          />
        </div>
      ) : (
        <p className="line-clamp-2 text-sm text-slate-500">{stripHtml(post.content)}</p>
      )}
      <div className="mt-auto flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-base text-slate-500">
          {post.writer.image ? (
            <Image
              src={post.writer.image}
              alt=""
              width={24}
              height={24}
              className="size-6 shrink-0 rounded-full object-cover"
            />
          ) : (
            <IcProfileYellow className="size-6 shrink-0" />
          )}
          <span className="flex items-center gap-1 whitespace-nowrap">
            <span className="max-w-[80px] truncate">{post.writer.name}</span>
            <span aria-hidden>·</span>
            <span>조회 {post.viewCount}</span>
          </span>
        </div>
        <div
          className="flex shrink-0 items-center gap-0.5 text-base text-slate-600"
          aria-label={`댓글 ${post.commentCount}개`}
        >
          <IcMessageCircle className="size-4 text-slate-600" />
          <span>{post.commentCount}</span>
        </div>
      </div>
    </Card>
  );
}
