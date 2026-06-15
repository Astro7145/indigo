'use client';

import { useTranslations } from 'next-intl';

import { IcEye, IcEyeOff } from '../../icons';

interface EyeButtonProps {
  hide: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export default function EyeButton({ hide, onClick }: EyeButtonProps) {
  const tCommon = useTranslations('common');

  return (
    <button
      aria-label={hide ? tCommon('passwordToggle.show') : tCommon('passwordToggle.hide')}
      aria-pressed={!hide}
      onClick={onClick}
      className="cursor-pointer"
    >
      {hide ? <IcEyeOff /> : <IcEye />}
    </button>
  );
}
