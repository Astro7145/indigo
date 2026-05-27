import Image from 'next/image';

import { IcMessageCircle } from '@/src/components/common/icons/IcMessageCircle';
import { IcProfileYellow } from '@/src/components/common/icons/IcProfileYellow';
import type { Post } from '@/src/types/post';

interface PostListItemProps {
  post: Post;
}

export default function PostListItem({ post }: PostListItemProps) {
  return (
    <article className="flex w-full items-center gap-4 border-b border-slate-300 px-2 py-6 md:gap-8 md:px-4 md:py-10">
      <div className="flex flex-1 flex-col gap-4 md:gap-[26px]">
        <div className="flex flex-col gap-2 md:gap-4">
          <h3 className="text-base font-semibold text-slate-900 md:text-xl">{post.title}</h3>
          <p className="line-clamp-1 text-sm text-slate-700 md:line-clamp-2 md:text-base">{post.content}</p>
        </div>
        <div className="flex items-center gap-2 text-xs md:text-base">
          <IcProfileYellow className="size-5 md:size-6" />
          <div className="flex items-center gap-1 text-slate-500">
            <span>{post.writer.name}</span>
            <span>·</span>
            <span>{post.createdAt.slice(0, 10).replace(/-/g, '.')}</span>
            <span>·</span>
            <span>조회 {post.viewCount}</span>
            <span>·</span>
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
          className="size-20 shrink-0 rounded border border-slate-200 object-cover md:size-[120px]"
        />
      )}
    </article>
  );
}
