'use client';

import { IcEye, IcEyeOff } from '../../icons';

interface EyeButtonProps {
  hide: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export default function EyeButton({ hide, onClick }: EyeButtonProps) {
  return (
    <button
      aria-label={hide ? '비밀번호 표시' : '비밀번호 숨기기'}
      aria-pressed={!hide}
      onClick={onClick}
      className="cursor-pointer"
    >
      {hide ? <IcEyeOff /> : <IcEye />}
    </button>
  );
}
