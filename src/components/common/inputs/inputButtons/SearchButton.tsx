import { useTranslations } from 'next-intl';

import { IcSearch } from '../../icons';

interface SearchButtonProps {
  onClick?: () => void;
}

export default function SearchButton({ onClick }: SearchButtonProps) {
  const tCommon = useTranslations('common');

  return (
    <button aria-label={tCommon('search.button')} onClick={onClick} className="cursor-pointer">
      <IcSearch />
    </button>
  );
}
