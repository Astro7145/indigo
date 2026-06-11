import { useTranslations } from 'next-intl';

import { IcSearch } from '../../icons';

interface SearchButtonProps {
  onClick?: () => void;
}

export default function SearchButton({ onClick }: SearchButtonProps) {
  const t = useTranslations('common');
  return (
    <button aria-label={t('search.button')} onClick={onClick} className="cursor-pointer">
      <IcSearch />
    </button>
  );
}
