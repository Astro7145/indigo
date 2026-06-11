'use client';

import { useTranslations } from 'next-intl';

import Input from './Input';
import SearchButton from './inputButtons/SearchButton';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: () => void;
}

export default function SearchInput({ onSearch, ...props }: SearchInputProps) {
  const t = useTranslations('common');
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
        placeholder={t('search.placeholder')}
        aria-label={t('search.label')}
        onKeyUp={handleEnterSearch}
        iconRight={<SearchButton onClick={handleSearch} />}
        {...props}
      />
    </search>
  );
}
