import { SVGProps } from 'react';
import { cn } from '@/src/utils/cn';

export function IcMonitor({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn('size-6 text-slate-400', className)} {...rest}>
      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 21H16M12 17V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
