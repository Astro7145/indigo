import { SVGProps } from 'react';
import { cn } from '@/src/utils/cn';

export function IcKebab({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn('size-6 text-slate-400', className)} {...rest}>
      <ellipse
        cx="11.9"
        cy="11.7006"
        rx="0.9"
        ry="0.9"
        transform="rotate(-90 11.9 11.7006)"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <ellipse
        cx="11.9"
        cy="19.5004"
        rx="0.9"
        ry="0.9"
        transform="rotate(-90 11.9 19.5004)"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <ellipse
        cx="11.9"
        cy="3.90078"
        rx="0.9"
        ry="0.9"
        transform="rotate(-90 11.9 3.90078)"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
