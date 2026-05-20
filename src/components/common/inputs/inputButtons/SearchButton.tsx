import { IcSearch } from '../../icons'

interface SearchButtonProps {
  onClick?: () => void
}

export default function SearchButton({ onClick }: SearchButtonProps) {
  return (
    <button aria-label="검색" onClick={onClick} className="cursor-pointer">
      <IcSearch />
    </button>
  )
}
