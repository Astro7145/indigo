import { SVGProps } from 'react';
import { cn } from '@/src/utils/cn';

interface IcDashboardProps extends SVGProps<SVGSVGElement> {
  state?: 'default' | 'active';
}

export function IcDashboard({ state = 'default', className, ...rest }: IcDashboardProps) {
  const variants: Record<'default' | 'active', string> = {
    default: 'size-6 text-slate-300',
    active: 'size-6 text-indigo-600',
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn(variants[state], className)} {...rest}>
      <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" />
      <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" />
      <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" />
      <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" />
    </svg>
  );
}
