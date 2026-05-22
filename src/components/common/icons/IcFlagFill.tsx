import { SVGProps } from 'react';
import { cn } from '@/src/utils/cn';

interface IcFlagFillProps extends SVGProps<SVGSVGElement> {
  state?: 'default' | 'active';
}

export function IcFlagFill({ state = 'default', className, ...rest }: IcFlagFillProps) {
  const variants: Record<'default' | 'active', string> = {
    default: 'size-6 text-slate-300',
    active: 'size-6 text-indigo-600',
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn(variants[state], className)} {...rest}>
      <path
        d="M19.5234 4L18.2197 7.25684C18.029 7.73366 18.029 8.26634 18.2197 8.74316L19.5234 12H6V4H19.5234Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <line x1="6" y1="6" x2="6" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
