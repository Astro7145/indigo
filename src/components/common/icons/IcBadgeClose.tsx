import { SVGProps } from 'react';
import { cn } from '@/src/utils/cn';

type BadgeColor = 'gray' | 'purple' | 'red' | 'yellow' | 'green';

interface IcBadgeCloseProps extends SVGProps<SVGSVGElement> {
  color?: BadgeColor;
}

const strokeMap: Record<BadgeColor, string> = {
  gray: '#A4A7AE',
  purple: '#B692F6',
  red: '#F97066',
  yellow: '#FDB022',
  green: '#47CD89',
};

export function IcBadgeClose({ color = 'gray', className, ...rest }: IcBadgeCloseProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={cn('size-4', className)} {...rest}>
      <path
        d="M11 5L5 11M5 5L11 11"
        stroke={strokeMap[color]}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
