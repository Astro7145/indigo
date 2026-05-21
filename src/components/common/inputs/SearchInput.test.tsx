import { fireEvent, render, screen } from '@testing-library/react'

import SearchInput from '@/src/components/common/inputs/SearchInput'

jest.mock('@/src/components/common/icons', () => ({
  IcSearch: () => <svg data-testid="ic-search" />,
}))

// jsdom이 HTML5 <search> 요소를 인식하지 못해 경고를 출력한다.
// 브라우저 표준 요소이므로 테스트에서는 경고만 억제한다.
// 주의: mock 내부에서 console.error를 그대로 호출하면 무한 재귀가 발생하므로
// 원본 참조를 먼저 캡처해 사용한다.
let originalConsoleError: typeof console.error

beforeAll(() => {
  originalConsoleError = console.error.bind(console)
  jest.spyOn(console, 'error').mockImplementation((msg: unknown, ...args: unknown[]) => {
    if (typeof msg === 'string' && msg.includes('<search>')) return
    originalConsoleError(msg, ...args)
  })
})

afterAll(() => {
  jest.restoreAllMocks()
})

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

it('Enter 키 입력 시 onSearch가 호출된다', () => {
  const onSearch = jest.fn()
  render(<SearchInput onSearch={onSearch} />)
  // handleEnterSearch는 Enter 키에만 반응한다
  fireEvent.keyUp(screen.getByRole('textbox'), { key: 'Enter' })
  expect(onSearch).toHaveBeenCalledTimes(1)
})

it('Enter 이외의 키 입력 시 onSearch가 호출되지 않는다', () => {
  const onSearch = jest.fn()
  render(<SearchInput onSearch={onSearch} />)
  fireEvent.keyUp(screen.getByRole('textbox'), { key: 'a' })
  expect(onSearch).not.toHaveBeenCalled()
})

it('onSearch prop 없이도 에러 없이 동작한다', () => {
  render(<SearchInput />)
  expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow()
})
