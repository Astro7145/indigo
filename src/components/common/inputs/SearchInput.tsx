'use client';

import Input from './Input';
import SearchButton from './inputButtons/SearchButton';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: () => void;
}

export default function SearchInput({ onSearch, ...props }: SearchInputProps) {
  const handleEnterSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSearch?.();
  };

  const handleSearch = () => {
    onSearch?.();
  };

  return (
    <search>
      <Input
        className="px-5 py-3 sm:px-5 sm:py-3"
        placeholder="할 일을 검색해주세요"
        aria-label="할 일 검색"
        onKeyUp={handleEnterSearch}
        iconRight={<SearchButton onClick={handleSearch} />}
        {...props}
      />
    </search>
  );
}
