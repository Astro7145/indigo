import { cn } from '@/src/utils/cn';

interface PostListEmptyProps {
  className?: string;
}

export default function PostListEmpty({ className }: PostListEmptyProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-6 py-24', className)}>
      <svg viewBox="0 0 120 120" fill="none" className="size-24 text-slate-300 md:size-32">
        <ellipse cx="60" cy="48" rx="36" ry="32" fill="currentColor" />
        <ellipse cx="60" cy="92" rx="40" ry="6" fill="currentColor" opacity="0.4" />
        <circle cx="50" cy="44" r="3" fill="white" />
        <circle cx="70" cy="44" r="3" fill="white" />
      </svg>
      <p className="text-sm text-slate-500">아직 등록된 게시물이 없어요.</p>
    </div>
  );
}
