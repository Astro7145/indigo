import { SVGProps } from 'react';
import { cn } from '@/src/utils/cn';

export function IcCheckbox({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 18 18" fill="none" className={cn('size-[18px] text-slate-400', className)} {...rest}>
      <rect x="3.75" y="3.75" width="10.5" height="10.5" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6.5 9.5L7.88923 10.7553C8.03995 10.8915 8.2717 10.8829 8.41194 10.736L11.5 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
