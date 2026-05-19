import SearchIcon from '../../icons/SearchIcon'

interface SearchButtonProps {
  onClick?: () => void
}

export default function SearchButton({ onClick }: SearchButtonProps) {
  return (
    <button onClick={onClick} className="cursor-pointer">
      <SearchIcon />
    </button>
  )
}
