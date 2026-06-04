import Card from '@/src/components/common/cards/Card';
import { postCardRootClass } from '@/src/components/post/PostCard';
import { cn } from '@/src/utils/cn';

// 베스트 게시글 fetch 동안 동일 외곽으로 자리를 잡아 검색바·목록이 아래로 밀리는 점프 방지.
export default function PostCardSkeleton() {
  return (
    <Card className={cn(postCardRootClass, 'animate-pulse')} aria-hidden>
      <div className="space-y-2">
        <div className="h-5 w-full rounded bg-slate-100" />
        <div className="h-5 w-2/3 rounded bg-slate-100" />
      </div>
      {/* sm+에서 카드 고정 높이를 자연스럽게 채우도록 가운데 블록을 늘림. 모바일은 기존 h-10 유지 */}
      <div className="h-10 rounded bg-slate-100 sm:h-auto sm:flex-1" />
      <div className="h-6 w-1/2 rounded bg-slate-100" />
    </Card>
  );
}
