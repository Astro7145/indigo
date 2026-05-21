import { SVGProps } from 'react';
import { cn } from '@/src/utils/cn';

interface IcTextItalicProps extends SVGProps<SVGSVGElement> {
  state?: 'default' | 'active';
}

export function IcTextItalic({ state = 'default', className, ...rest }: IcTextItalicProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn('size-8', state === 'default' ? 'text-slate-500' : 'text-slate-700', className)}
      {...rest}
    >
      {state === 'active' && <rect width="32" height="32" rx="8" fill="var(--color-slate-200)" />}
      <path
        d="M21.8332 9.33301H14.3332M17.6665 22.6663H10.1665M18.4998 9.33301L13.4998 22.6663"
        stroke="currentColor"
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
