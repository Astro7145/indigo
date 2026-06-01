import { type ComponentPropsWithoutRef } from 'react';

import { IcBadgeClose, IcLink } from '@/src/components/common/icons';

interface LinkInputProps extends Omit<ComponentPropsWithoutRef<'input'>, 'type'> {
  showClear?: boolean;
  onClear: () => void;
}

export default function LinkInput({ showClear, onClear, ...props }: LinkInputProps) {
  return (
    <div className="flex items-center gap-2 rounded-sm border border-dashed border-slate-300 bg-slate-50 p-4 focus-within:border-indigo-500">
      <IcLink className="size-6 shrink-0 text-slate-500" />
      <input
        type="text"
        placeholder="링크를 업로드해주세요"
        className="min-w-0 flex-1 bg-transparent text-base text-slate-700 outline-none placeholder:text-slate-500"
        {...props}
      />
      {showClear && (
        <button type="button" onClick={onClear} className="shrink-0" aria-label="링크 삭제">
          <IcBadgeClose className="size-5 text-slate-400" />
        </button>
      )}
    </div>
  );
}
