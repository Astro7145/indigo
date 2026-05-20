import { fireEvent, render, screen } from '@testing-library/react'

import SearchInput from '@/src/components/common/inputs/SearchInput'

jest.mock('@/src/components/common/icons', () => ({
  IcSearch: () => <svg data-testid="ic-search" />,
}))

it('"할 일을 검색해주세요" placeholder인 input을 렌더링한다', () => {
  render(<SearchInput />)
  expect(screen.getByPlaceholderText('할 일을 검색해주세요')).toBeInTheDocument()
})

it('검색 버튼을 렌더링한다', () => {
  render(<SearchInput />)
  expect(screen.getByRole('button')).toBeInTheDocument()
})

it('검색 버튼 클릭 시 onSearch가 호출된다', () => {
  const onSearch = jest.fn()
  render(<SearchInput onSearch={onSearch} />)
  fireEvent.click(screen.getByRole('button'))
  expect(onSearch).toHaveBeenCalledTimes(1)
})

it('input keyup 이벤트 시 onSearch가 호출된다', () => {
  const onSearch = jest.fn()
  render(<SearchInput onSearch={onSearch} />)
  fireEvent.keyUp(screen.getByRole('textbox'))
  expect(onSearch).toHaveBeenCalledTimes(1)
})

it('onSearch prop 없이도 에러 없이 동작한다', () => {
  render(<SearchInput />)
  expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow()
})
