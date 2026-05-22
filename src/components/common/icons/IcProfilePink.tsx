'use client';

import { SVGProps, useId } from 'react';
import { cn } from '@/src/utils/cn';

export function IcProfilePink({ className, ...rest }: SVGProps<SVGSVGElement>) {
  const id = useId();
  return (
    <svg viewBox="0 0 39 39" fill="none" className={cn('size-[39px]', className)} {...rest}>
      <circle cx="19.5" cy="19.5" r="19.5" fill="#FFE3E3" />
      <circle cx="24.2796" cy="18.9067" r="3.79432" fill="var(--color-white)" />
      <circle cx="25.2587" cy="18.1726" r="1.95836" fill="var(--color-slate-700)" />
      <circle cx="17.303" cy="18.9067" r="3.79432" fill="var(--color-white)" />
      <circle cx="18.5268" cy="18.1726" r="1.95836" fill="var(--color-slate-700)" />
      <path
        d="M22.2239 23.8878C22.2239 24.1571 21.7874 24.3753 21.2489 24.3753C20.7104 24.3753 20.2739 24.1571 20.2739 23.8878"
        stroke="#96582D"
        strokeWidth="0.957037"
        strokeLinecap="round"
      />
      <ellipse cx="20.0302" cy="28.5186" rx="11.4562" ry="2.19375" fill="#F1BEBE" />
      <g filter={`url(#${id})`}>
        <path
          d="M31.9448 21.3462C31.587 27.5437 26.0843 28.8919 19.2037 28.8919C12.3231 28.8919 6.48072 27.2476 6.48072 21.3462C6.48072 13.541 12.8656 9.01869 19.7462 9.01869C28.0804 9.01869 32.2339 16.3395 31.9448 21.3462Z"
          fill="#FF9494"
        />
      </g>
      <circle cx="22.905" cy="20.4919" r="4.0518" fill="var(--color-white)" />
      <circle cx="15.4552" cy="20.4919" r="4.0518" fill="var(--color-white)" />
      <path
        d="M23.7182 19.3566L20.6619 20.8848L23.7182 22.4129"
        stroke="var(--color-black)"
        strokeWidth="0.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5493 19.3566L17.6056 20.8848L14.5493 22.4129"
        stroke="var(--color-black)"
        strokeWidth="0.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21.1713 20.8848H24.2276M17.0962 20.8848C17.0962 20.8848 15.0345 21.0213 14.0399 21.0213"
        stroke="var(--color-black)"
        strokeWidth="0.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21.6807 24.4505C21.6807 25.5758 20.7684 26.488 19.6431 26.488C18.5178 26.488 17.6056 25.5758 17.6056 24.4505H21.6807Z"
        fill="#78431D"
      />
      <defs>
        <filter
          id={id}
          x="6.48072"
          y="9.01869"
          width="25.4782"
          height="19.8735"
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
          <feColorMatrix type="matrix" values="0 0 0 0 0.957692 0 0 0 0 0.3002 0 0 0 0 0.3002 0 0 0 0.36 0" />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_21209_64463" />
        </filter>
      </defs>
    </svg>
  );
}
