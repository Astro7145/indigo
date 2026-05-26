import { IcMessageCircle } from '@/src/components/common/icons/IcMessageCircle';
import { IcProfileYellow } from '@/src/components/common/icons/IcProfileYellow';
import type { Post } from '@/src/types/post';

interface PostListItemProps {
  post: Post;
}

export default function PostListItem({ post }: PostListItemProps) {
  return (
    <article className="flex w-full gap-6 border-b border-slate-200 py-6">
      <div className="flex flex-1 flex-col gap-3">
        <h3 className="text-lg font-medium text-slate-900">{post.title}</h3>
        <p className="line-clamp-2 text-sm text-slate-600">{post.content}</p>
        <div className="mt-auto flex items-center gap-2 text-xs text-slate-500">
          <IcProfileYellow className="size-5" />
          <span>{post.writer.name}</span>
          <span>·</span>
          <span>{post.createdAt.slice(0, 10).replace(/-/g, '.')}</span>
          <span>·</span>
          <span>조회 {post.viewCount}</span>
          <span className="ml-auto inline-flex items-center gap-1">
            <IcMessageCircle className="size-4" />
            <span>{post.commentCount}</span>
          </span>
        </div>
      </div>
      {post.image && <img src={post.image} alt="" className="size-24 shrink-0 rounded object-cover" />}
    </article>
  );
}
