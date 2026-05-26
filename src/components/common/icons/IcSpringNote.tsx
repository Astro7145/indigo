import { SVGProps } from 'react';
import { cn } from '@/src/utils/cn';

interface IcSpringNoteProps extends SVGProps<SVGSVGElement> {
  size?: 'sm' | 'lg';
  bgShape?: 'square' | 'circle';
}

export function IcSpringNote({ size = 'sm', bgShape = 'square', className, ...rest }: IcSpringNoteProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={cn(size === 'lg' ? 'size-[180px]' : 'size-8', className)} {...rest}>
      {bgShape === 'circle' ? (
        <circle cx="20" cy="20" r="20" fill="var(--color-indigo-300)" />
      ) : (
        <rect width="40" height="40" rx="4" fill="var(--color-indigo-300)" />
      )}
      <svg x="11.25" y="8.82" width="17.5" height="22.36" viewBox="0 0 14 18">
        <path
          d="M0 2.33339C0 1.47428 0.696446 0.777832 1.55556 0.777832H12.4444C13.3036 0.777832 14 1.47428 14 2.33339V16.3334C14 17.1925 13.3036 17.8889 12.4444 17.8889H1.55556C0.696446 17.8889 0 17.1925 0 16.3334V2.33339Z"
          fill="var(--color-indigo-500)"
        />
        <path
          d="M0 2.33339C0 1.47428 0.696446 0.777832 1.55556 0.777832H12.4444C13.3036 0.777832 14 1.47428 14 2.33339V4.66672H0V2.33339Z"
          fill="var(--color-white)"
        />
        <path d="M2.3335 7H11.6668V8.55556H2.3335V7Z" fill="var(--color-indigo-700)" />
        <path d="M2.3335 10.1113H11.6668V11.6669H2.3335V10.1113Z" fill="var(--color-indigo-700)" />
        <path d="M2.3335 13.2222H11.6668V14.7777H2.3335V13.2222Z" fill="var(--color-indigo-700)" />
        <path
          d="M10.8887 -3.39977e-08C11.3183 -1.52213e-08 11.6665 0.348223 11.6665 0.777778L11.6665 1.55556C11.6665 1.98511 11.3183 2.33333 10.8887 2.33333C10.4592 2.33333 10.1109 1.98511 10.1109 1.55556L10.1109 0.777778C10.1109 0.348223 10.4592 -5.27742e-08 10.8887 -3.39977e-08Z"
          fill="var(--color-indigo-700)"
        />
        <path
          d="M7.00005 -3.39977e-08C7.42961 -1.52213e-08 7.77783 0.348223 7.77783 0.777778L7.77783 1.55556C7.77783 1.98511 7.42961 2.33333 7.00005 2.33333C6.5705 2.33333 6.22228 1.98511 6.22228 1.55556L6.22228 0.777778C6.22228 0.348223 6.5705 -5.27742e-08 7.00005 -3.39977e-08Z"
          fill="var(--color-indigo-700)"
        />
        <path
          d="M3.11089 -3.39977e-08C3.54045 -1.52213e-08 3.88867 0.348223 3.88867 0.777778L3.88867 1.55556C3.88867 1.98511 3.54045 2.33333 3.11089 2.33333C2.68134 2.33333 2.33312 1.98511 2.33312 1.55556L2.33312 0.777778C2.33312 0.348223 2.68134 -5.27742e-08 3.11089 -3.39977e-08Z"
          fill="var(--color-indigo-700)"
        />
      </svg>
    </svg>
  );
}
