'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

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
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSortOpen) return;

    function handleOutside(event: MouseEvent) {
      if (sortContainerRef.current && !sortContainerRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isSortOpen]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  const currentLabel = SORT_OPTIONS.find((opt) => opt.value === sortBy)!.label;

  return (
    <div className="flex w-full items-center justify-between gap-4">
      {/*
        공통 SearchInput을 재사용. 단 현재 SearchInput은 두 가지 한계가 있어 시각이 Figma와 다름.
        - Input(`src/components/common/inputs/Input.tsx`)의 `<input>`에 `flex-1` 누락 → iconRight가 우측 끝에 정렬 안 됨
        - SearchInput에 폭·높이 override prop(`containerClassName` 등) 없음 → Figma 다양한 사이즈
          (48 높이: 320/280/248/432, 40 높이: 432/239/210) 매칭 불가
        작성자 측 수정 후 `<SearchInput ... containerClassName="w-full md:w-[432px]" />` 형태로 교체 예정.
        반응형은 외부 wrapper에서 처리.
      */}
      <div className="flex-1 md:w-[432px] md:flex-none">
        <SearchInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onSearch={() => updateParam('search', input)}
          placeholder="궁금한 내용을 검색해주세요"
          aria-label="게시글 검색"
        />
      </div>

      <div ref={sortContainerRef} className="relative">
        <button
          type="button"
          onClick={() => setIsSortOpen((prev) => !prev)}
          className="inline-flex items-center gap-1.5 text-sm text-slate-700"
        >
          {currentLabel}
          <IcFilter className="size-5 text-slate-500" />
        </button>

        {isSortOpen && (
          <ul
            role="menu"
            className="absolute right-0 z-10 mt-2 w-32 rounded border border-slate-200 bg-white py-1 shadow-md"
          >
            {SORT_OPTIONS.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    updateParam('sortBy', opt.value);
                    setIsSortOpen(false);
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
