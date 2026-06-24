import { SVGProps } from 'react';
import { cn } from '@/src/utils/cn';

export function IcRefresh({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn('size-6 text-black', className)} {...rest}>
      <path
        d="M19.2812 6.70994C18.0216 4.97628 16.1847 3.74894 14.101 3.24868C12.0173 2.74843 9.82345 3.00808 7.91409 3.98095C6.00472 4.95382 4.50515 6.57605 3.68509 8.55585C2.86502 10.5357 2.77829 12.7431 3.44049 14.7811C4.10269 16.8192 5.47037 18.5541 7.29751 19.6737C9.12466 20.7934 11.2914 21.2244 13.4079 20.8892C15.5245 20.5539 17.4519 19.4745 18.8437 17.845C19.907 16.5999 20.6043 15.0962 20.8741 13.5M15.5002 7.94971H19.3793C19.9316 7.94971 20.3793 7.50199 20.3793 6.94971V3.07067"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
