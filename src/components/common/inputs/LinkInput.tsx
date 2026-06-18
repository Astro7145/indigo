import { useTranslations } from 'next-intl';
import { type ComponentPropsWithoutRef } from 'react';

import { IcBadgeClose, IcLink } from '@/src/components/common/icons';

interface LinkInputProps extends Omit<ComponentPropsWithoutRef<'input'>, 'type'> {
  showClear?: boolean;
  onClear: () => void;
}

export default function LinkInput({ showClear, onClear, ...props }: LinkInputProps) {
  const tCommon = useTranslations('common');

  return (
    <div className="dark:bg-indigo-dark-300 flex items-center gap-2 rounded-sm border border-dashed border-slate-300 bg-slate-50 p-3 focus-within:border-indigo-500 sm:p-4 dark:border-white/20">
      <IcLink className="size-5 shrink-0 text-slate-500 sm:size-6 dark:text-white/70" />
      <input
        type="text"
        placeholder={tCommon('linkUploadPlaceholder')}
        className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-500 sm:text-base dark:text-white dark:placeholder:text-white/40"
        {...props}
      />
      {showClear && (
        <button type="button" onClick={onClear} className="shrink-0" aria-label={tCommon('linkDelete')}>
          <IcBadgeClose className="size-5 text-slate-400 dark:text-white/40" />
        </button>
      )}
    </div>
  );
}
