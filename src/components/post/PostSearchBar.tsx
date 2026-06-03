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
      {/* `<input>`의 기본 intrinsic min-width(size=20) 때문에 좁은 모바일 폭에서 wrapper를 못 줄여 아이콘이 튀어나간다.
          본래는 공통 SearchInput/Input의 inner <input>에 min-w-0이 들어가야 할 보정이지만, 공통 컴포넌트 변경 합의 전까지
          여기서 임의 variant로 descendant input에 주입해 PostSearchBar만 안전하게 만든다. */}
      <div className="min-w-0 flex-1 sm:w-[432px] sm:flex-none [&_input]:min-w-0">
        <SearchInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onSearch={() => updateParam('search', input)}
          placeholder="궁금한 내용을 검색해주세요"
          aria-label="게시글 검색"
        />
      </div>

      <Dropdown>
        <Dropdown.Trigger className="inline-flex shrink-0 items-center gap-1 text-sm whitespace-nowrap text-slate-700 sm:gap-3 sm:text-base">
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
