import { Logo } from '@/src/components/common/icons/Logo';
import { cn } from '@/src/utils/cn';

interface PostListEmptyProps {
  className?: string;
}

export default function PostListEmpty({ className }: PostListEmptyProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-6 py-24', className)}>
      <Logo size="lg" />
      <p className="text-sm text-slate-500">아직 등록된 게시물이 없어요.</p>
    </div>
  );
}
