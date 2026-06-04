import { SVGProps } from 'react';
import { cn } from '@/src/utils/cn';

export function IcHash({ className, ...rest }: SVGProps<SVGSVGElement>) {
  // 10×12 글리프를 18×18 viewBox에 패딩해(음수 origin으로 가운데 정렬) 인접 메타 아이콘과 시각 크기·여백을 맞춘다
  return (
    <svg viewBox="-4 -3 18 18" fill="none" className={cn('size-4 text-slate-400', className)} {...rest}>
      <path
        d="M5.09375 11.3125L5.57812 8.39062H3.14062L2.65625 11.3125H1.10938L1.59375 8.39062H0L0.25 6.85938H1.84375L2.23438 4.45312H0.65625L0.90625 2.92188H2.5L2.96875 0H4.51562L4.04688 2.92188H6.48438L6.95312 0H8.48438L8.01562 2.92188H9.60938L9.34375 4.45312H7.75L7.35938 6.85938H8.95312L8.70312 8.39062H7.10938L6.625 11.3125H5.09375ZM3.39062 6.85938H5.82812L6.21875 4.45312H3.78125L3.39062 6.85938Z"
        fill="currentColor"
      />
    </svg>
  );
}
