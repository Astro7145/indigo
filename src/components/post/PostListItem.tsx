import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { IcMessageCircle } from '@/src/components/common/icons/IcMessageCircle';
import { IcProfileYellow } from '@/src/components/common/icons/IcProfileYellow';
import type { Post } from '@/src/types/post';
import { formatRelativeTime } from '@/src/utils/date';
import { stripHtml } from '@/src/utils/stripHtml';

interface PostListItemProps {
  post: Post;
  onClick?: () => void;
}

export default function PostListItem({ post, onClick }: PostListItemProps) {
  const t = useTranslations('posts');
  return (
    <article
      className="flex w-full cursor-pointer items-center gap-6 border-b border-slate-300 px-2 py-6 sm:gap-8 sm:px-4 sm:py-10"
      onClick={onClick}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-[26px]">
        <div className="flex flex-col gap-1 sm:gap-4">
          <h3 className="truncate text-sm font-semibold text-slate-900 sm:text-xl sm:leading-[30px] sm:whitespace-normal">
            {post.title}
          </h3>
          <p className="truncate text-sm text-slate-700 sm:line-clamp-2 sm:min-h-[48px] sm:text-base sm:whitespace-normal">
            {stripHtml(post.content)}
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500 sm:gap-2 sm:text-base">
          {post.writer.image ? (
            <Image
              src={post.writer.image}
              alt=""
              width={24}
              height={24}
              className="size-5 shrink-0 rounded-full object-cover sm:size-6"
            />
          ) : (
            <IcProfileYellow className="size-5 shrink-0 sm:size-6" />
          )}
          <div className="flex items-center gap-0.5 whitespace-nowrap sm:gap-1">
            <span>{post.writer.name}</span>
            <span aria-hidden>·</span>
            <span>{formatRelativeTime(post.createdAt)}</span>
            <span aria-hidden>·</span>
            <span>{t('viewCount', { count: post.viewCount })}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-0.5 text-slate-600">
              <IcMessageCircle className="size-3 sm:size-4" />
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
          className="size-[72px] shrink-0 rounded border border-slate-200 object-cover sm:size-[120px]"
        />
      )}
    </article>
  );
}
