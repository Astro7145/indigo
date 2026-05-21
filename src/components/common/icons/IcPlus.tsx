import { SVGProps } from 'react';
import { cn } from '@/src/utils/cn';

export function IcPlus({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn('size-6 text-white', className)} {...rest}>
      <path d="M5 12H18.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M11.75 18.75V5.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
