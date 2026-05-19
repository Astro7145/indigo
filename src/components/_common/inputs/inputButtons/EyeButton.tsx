'use client'

import { useState } from 'react'
import EyeIcon from '../../icons/EyeIcon'

interface EyeButtonProps {
  onClick?: () => void
}

export default function EyeButton({ onClick }: EyeButtonProps) {
  const [hide, setHide] = useState(true)

  const handleToggle = () => {
    setHide(!hide)

    if (onClick) {
      onClick()
    }
  }

  return (
    <button onClick={handleToggle} className="cursor-pointer">
      <EyeIcon hide={hide} />
    </button>
  )
}
