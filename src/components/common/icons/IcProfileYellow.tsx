'use client';

import { SVGProps, useId } from 'react';
import { cn } from '@/src/utils/cn';

export function IcProfileYellow({ className, ...rest }: SVGProps<SVGSVGElement>) {
  const id = useId();
  return (
    <svg viewBox="0 0 39 39" fill="none" className={cn('size-[39px]', className)} {...rest}>
      <circle cx="19.5001" cy="19.5001" r="19.5001" fill="#F9F4D3" />
      <circle cx="24.2798" cy="18.9068" r="3.79434" fill="var(--color-white)" />
      <circle cx="25.2589" cy="18.1727" r="1.95837" fill="var(--color-slate-700)" />
      <circle cx="17.3031" cy="18.9068" r="3.79434" fill="var(--color-white)" />
      <circle cx="18.5269" cy="18.1727" r="1.95837" fill="var(--color-slate-700)" />
      <path
        d="M22.224 23.888C22.224 24.1572 21.7875 24.3755 21.249 24.3755C20.7106 24.3755 20.274 24.1572 20.274 23.888"
        stroke="#96582D"
        strokeWidth="0.957037"
        strokeLinecap="round"
      />
      <ellipse cx="20.0303" cy="28.5188" rx="11.4563" ry="2.19376" fill="#F1DEBE" />
      <g filter={`url(#${id})`}>
        <path
          d="M31.945 21.3464C31.5872 27.5439 26.0845 28.8921 19.2038 28.8921C12.3231 28.8921 6.48077 27.2478 6.48077 21.3464C6.48077 13.5411 12.8657 9.01875 19.7464 9.01875C28.0806 9.01875 32.2341 16.3396 31.945 21.3464Z"
          fill="#FFB951"
        />
      </g>
      <circle cx="22.9051" cy="20.492" r="4.05183" fill="var(--color-white)" />
      <circle cx="23.9507" cy="19.7079" r="2.09127" fill="var(--color-slate-700)" />
      <circle cx="15.4553" cy="20.492" r="4.05183" fill="var(--color-white)" />
      <circle cx="16.7625" cy="19.7079" r="2.09127" fill="var(--color-slate-700)" />
      <path
        d="M19.9366 24.8262C19.9366 25.1918 19.5767 25.4881 19.1328 25.4881C18.6889 25.4881 18.329 25.1918 18.329 24.8262"
        stroke="#78431D"
        strokeWidth="0.478518"
        strokeLinecap="round"
      />
      <defs>
        <filter
          id={id}
          x="6.48077"
          y="9.01875"
          width="25.4783"
          height="19.8736"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="-2.87111" dy="-0.957037" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.957692 0 0 0 0 0.508406 0 0 0 0 0.3002 0 0 0 0.36 0" />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_21209_64443" />
        </filter>
      </defs>
    </svg>
  );
}
