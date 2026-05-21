'use client'

import { SVGProps, useId } from 'react';
import { cn } from '@/src/utils/cn';

export function IcCheckedTask({ className, ...rest }: SVGProps<SVGSVGElement>) {
  const id = useId()

  return (
    <svg viewBox="0 0 180 180" fill="none" className={cn('size-45', className)} {...rest}>
      <rect width="180" height="180" rx="90" fill="var(--color-indigo-200)" />
      <rect x="52" y="51.4712" width="76.4762" height="87.9476" rx="7.64763" fill={`url(#${id})`} />
      <rect x="59.6475" y="59.1191" width="61.181" height="72.6524" rx="3.82381" fill="var(--color-white)" />
      <path
        d="M71.1191 51.4712H109.357V66.7664C109.357 68.8783 107.645 70.5902 105.533 70.5902H74.943C72.8311 70.5902 71.1191 68.8783 71.1191 66.7664V51.4712Z"
        fill="var(--color-indigo-700)"
      />
      <circle cx="90.238" cy="51.4714" r="11.4714" fill="var(--color-indigo-700)" />
      <circle cx="90.2379" cy="51.4713" r="3.82381" fill="var(--color-indigo-300)" />
      <rect x="82.5381" y="80.9092" width="29.7" height="5.5" fill="var(--color-slate-200)" />
      <rect x="82.5381" y="110.609" width="29.7" height="5.5" fill="var(--color-slate-200)" />
      <rect x="82.5381" y="95.2095" width="29.7" height="5.5" fill="var(--color-slate-200)" />
      <path
        d="M69.8267 83.5467L72.351 86.071C72.5121 86.2321 72.7733 86.2321 72.9343 86.071L77.6489 81.3564"
        stroke="var(--color-indigo-600)"
        strokeWidth="4.4"
        strokeLinecap="round"
      />
      <path
        d="M69.8267 113.246L72.351 115.771C72.5121 115.932 72.7733 115.932 72.9343 115.771L77.6489 111.056"
        stroke="var(--color-indigo-600)"
        strokeWidth="4.4"
        strokeLinecap="round"
      />
      <path
        d="M69.8267 97.8465L72.351 100.371C72.5121 100.532 72.7733 100.532 72.9343 100.371L77.6489 95.6562"
        stroke="var(--color-indigo-600)"
        strokeWidth="4.4"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient
          id={id}
          x1="90.2381"
          y1="51.4712"
          x2="90.2381"
          y2="139.419"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--color-indigo-600)" />
          <stop offset="1" stopColor="var(--color-indigo-500)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
