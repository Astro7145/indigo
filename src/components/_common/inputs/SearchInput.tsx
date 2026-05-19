'use client'

import Input from './Input'
import SearchButton from './inputButtons/SearchButton'

interface SearchInputProps {
  onSearch?: () => void
}

export default function SearchInput({ onSearch }: SearchInputProps) {
  const handleSearch = () => {
    onSearch?.()
  }

  return (
    <Input
      className="px-5 py-3 sm:px-5 sm:py-3"
      placeholder="할 일을 검색해주세요"
      onKeyUp={handleSearch}
      iconRight={<SearchButton onClick={handleSearch} />}
    />
  )
}
