import { IcSearch } from '../../icons'

interface SearchButtonProps {
  onClick?: () => void
}

export default function SearchButton({ onClick }: SearchButtonProps) {
  return (
    <button onClick={onClick} className="cursor-pointer">
      <IcSearch />
    </button>
  )
}
