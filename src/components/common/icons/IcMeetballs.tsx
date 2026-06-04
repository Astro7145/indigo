import { SVGProps } from 'react';
import { cn } from '@/src/utils/cn';

export function IcMeetballs({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn('size-6 text-slate-500', className)} {...rest}>
      <circle cx="6.14941" cy="12.291" r="1.5" fill="currentColor" />
      <circle cx="12.1494" cy="12.291" r="1.5" fill="currentColor" />
      <circle cx="18.1494" cy="12.291" r="1.5" fill="currentColor" />
    </svg>
  );
}
