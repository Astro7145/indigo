import { useTranslations } from 'next-intl';

import { Logo } from '@/src/components/common/icons/Logo';
import { cn } from '@/src/utils/cn';

interface PostListEmptyProps {
  className?: string;
}

export default function PostListEmpty({ className }: PostListEmptyProps) {
  const t = useTranslations('posts');
  return (
    <div className={cn('flex flex-col items-center justify-center gap-6 py-24', className)}>
      {/* empty image 확인할 것 */}
      <Logo size="lg" />
      <p className="text-sm text-slate-500">{t('empty')}</p>
    </div>
  );
}
