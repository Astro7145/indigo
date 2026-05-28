import Image from 'next/image';

import { IcMessageCircle } from '@/src/components/common/icons/IcMessageCircle';
import { IcProfileYellow } from '@/src/components/common/icons/IcProfileYellow';
import type { Post } from '@/src/types/post';

interface PostListItemProps {
  post: Post;
  onClick?: () => void;
}

export default function PostListItem({ post, onClick }: PostListItemProps) {
  return (
    <article
      className="flex w-full cursor-pointer items-center gap-6 border-b border-slate-300 px-2 py-6 md:gap-8 md:px-4 md:py-10"
      onClick={onClick}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-3 md:gap-[26px]">
        <div className="flex flex-col gap-1 md:gap-4">
          <h3 className="truncate text-sm font-semibold text-slate-900 md:text-xl md:leading-[30px] md:whitespace-normal">
            {post.title}
          </h3>
          {/* 에디터 HTML에서 태그만 제거. &amp; 등 HTML 엔티티는 미처리 — 필요 시 DOM 방식으로 교체 */}
          <p className="truncate text-sm text-slate-700 md:line-clamp-2 md:min-h-[48px] md:text-base md:whitespace-normal">
            {post.content.replace(/<[^>]+>/g, '')}
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500 md:gap-2 md:text-base">
          <IcProfileYellow className="size-5 shrink-0 md:size-6" />
          <div className="flex items-center gap-0.5 whitespace-nowrap md:gap-1">
            <span>{post.writer.name}</span>
            <span aria-hidden>·</span>
            <span>{post.createdAt.slice(0, 10).replace(/-/g, '.')}</span>
            <span aria-hidden>·</span>
            <span>조회 {post.viewCount}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-0.5 text-slate-600">
              <IcMessageCircle className="size-3 md:size-4" />
              {post.commentCount}
            </span>
          </div>
        </div>
      </div>
      {post.image && (
        <Image
          src={post.image}
          alt=""
          width={120}
          height={120}
          className="size-[72px] shrink-0 rounded border border-slate-200 object-cover md:size-[120px]"
        />
      )}
    </article>
  );
}
