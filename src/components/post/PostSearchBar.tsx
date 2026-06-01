'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import Dropdown from '@/src/components/common/dropdown/Dropdown';
import { IcFilter } from '@/src/components/common/icons/IcFilter';
import SearchInput from '@/src/components/common/inputs/SearchInput';

type SortBy = 'latest' | 'popular';

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
];

export default function PostSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sortBy = (searchParams.get('sortBy') as SortBy) ?? 'latest';

  const [input, setInput] = useState(searchParams.get('search') ?? '');

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  // URL의 sortBy가 임의값/오타일 수 있으므로 매칭 실패 시 첫 옵션으로 폴백한다.
  const currentLabel = (SORT_OPTIONS.find((opt) => opt.value === sortBy) ?? SORT_OPTIONS[0]).label;

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex-1 md:w-[432px] md:flex-none">
        <SearchInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onSearch={() => updateParam('search', input)}
          placeholder="궁금한 내용을 검색해주세요"
          aria-label="게시글 검색"
        />
      </div>

      <Dropdown>
        <Dropdown.Trigger className="inline-flex items-center gap-1 text-sm text-slate-700 md:gap-3 md:text-base">
          {currentLabel}
          <IcFilter className="size-5 text-slate-500" />
        </Dropdown.Trigger>
        <Dropdown.Menu placement="bottom-end" size="small">
          {SORT_OPTIONS.map((opt) => (
            <Dropdown.Item key={opt.value} onClick={() => updateParam('sortBy', opt.value)}>
              {opt.label}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}
