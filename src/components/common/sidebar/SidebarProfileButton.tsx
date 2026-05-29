'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMe } from '@/src/hooks/user';
import { IcChevron } from '../icons';

export default function SidebarProfileButton() {
  const { data, isLoading } = useMe();

  return (
    <Link
      href="/me"
      className="flex w-full items-center gap-x-2 rounded-sm border border-indigo-600 bg-indigo-800/20 py-3 pr-6 pl-3 transition-shadow hover:shadow-[inset_0_0_8px_0_rgba(255,255,255,0.4)]"
    >
      {isLoading ? (
        <span aria-hidden className="size-9 shrink-0 animate-pulse rounded-full bg-indigo-800" />
      ) : data?.image ? (
        <Image
          src={data.image}
          alt={data.name}
          width={36}
          height={36}
          unoptimized
          className="size-9 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span aria-hidden className="size-9 shrink-0 rounded-full bg-indigo-600" />
      )}
      <span className="flex flex-col items-start">
        {isLoading ? (
          <span aria-hidden className="h-4 w-16 animate-pulse rounded-xs bg-indigo-800" />
        ) : (
          <span className="flex items-center gap-x-1">
            <span className="text-sm font-medium text-slate-50">{data?.name}</span>
            <IcChevron direction="right" className="size-4 text-white" />
          </span>
        )}
        {isLoading ? (
          <span aria-hidden className="mt-2 h-4 w-32 animate-pulse rounded-xs bg-indigo-800" />
        ) : (
          <span className="text-sm font-normal text-slate-400">{data?.email}</span>
        )}
      </span>
    </Link>
  );
}
