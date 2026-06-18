import { SVGProps } from 'react';
import { cn } from '@/src/utils/cn';

export function IcGraph({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn('size-6 text-slate-400', className)} {...rest}>
      {/* 노드를 잇는 간선 — 원(노드)을 강조하려 얇게, 노드 원이 위에 덮여 끝점을 깔끔히 가린다 */}
      <path d="M12 5L6 18M12 5L18 18M6 18H18" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      {/* 노드 — 간선보다 도드라지게 크게 */}
      <circle cx="12" cy="5" r="3.1" fill="currentColor" />
      <circle cx="6" cy="18" r="3.1" fill="currentColor" />
      <circle cx="18" cy="18" r="3.1" fill="currentColor" />
    </svg>
  );
}
