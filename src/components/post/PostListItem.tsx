import { IcMessageCircle } from '@/src/components/common/icons/IcMessageCircle';
import { IcProfileYellow } from '@/src/components/common/icons/IcProfileYellow';
import type { Post } from '@/src/types/post';

interface PostListItemProps {
  post: Post;
}

export default function PostListItem({ post }: PostListItemProps) {
  return (
    <article className="flex w-full items-center gap-8 border-b border-slate-300 px-4 py-10">
      <div className="flex flex-1 flex-col gap-[26px]">
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-semibold text-slate-900">{post.title}</h3>
          <p className="line-clamp-2 text-base text-slate-700">{post.content}</p>
        </div>
        <div className="flex items-center gap-2 text-base">
          <IcProfileYellow className="size-6" />
          <div className="flex items-center gap-1 text-slate-500">
            <span>{post.writer.name}</span>
            <span>·</span>
            <span>{post.createdAt.slice(0, 10).replace(/-/g, '.')}</span>
            <span>·</span>
            <span>조회 {post.viewCount}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-0.5 text-slate-600">
              <IcMessageCircle className="size-4" />
              {post.commentCount}
            </span>
          </div>
        </div>
      </div>
      {post.image && (
        <img src={post.image} alt="" className="size-[120px] shrink-0 rounded border border-slate-200 object-cover" />
      )}
    </article>
  );
}
