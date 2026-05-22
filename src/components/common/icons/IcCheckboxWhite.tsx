import { SVGProps } from 'react';
import { cn } from '@/src/utils/cn';

interface IcCheckboxWhiteProps extends SVGProps<SVGSVGElement> {
  state?: 'default' | 'active';
}

export function IcCheckboxWhite({ state = 'default', className, ...rest }: IcCheckboxWhiteProps) {
  if (state === 'default') {
    return (
      <svg
        viewBox="0 0 18 18"
        fill="none"
        style={{ overflow: 'visible' }}
        className={cn('size-[18px] text-indigo-200', className)}
        {...rest}
      >
        <rect width="18" height="18" rx="2" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 18 18"
      fill="none"
      style={{ overflow: 'visible' }}
      className={cn('size-[18px]', className)}
      {...rest}
    >
      <rect width="18" height="18" rx="2" fill="var(--color-indigo-200)" />
      <path
        d="M5.44434 9.21572L7.73917 11.5106C7.88562 11.657 8.12305 11.657 8.2695 11.5106L12.5554 7.22461"
        stroke="var(--color-indigo-600)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
