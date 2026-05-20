'use client'

import { IcEye, IcEyeOff } from '../../icons'

interface EyeButtonProps {
  hide: boolean
  onClick?: () => void
}

export default function EyeButton({ hide, onClick }: EyeButtonProps) {
  const handleToggle = () => {
    if (onClick) {
      onClick()
    }
  }

  return (
    <button
      aria-label={hide ? '비밀번호 표시' : '비밀번호 숨기기'}
      aria-pressed={!hide}
      onClick={handleToggle}
      className="cursor-pointer"
    >
      {hide ? <IcEyeOff /> : <IcEye />}
    </button>
  )
}
