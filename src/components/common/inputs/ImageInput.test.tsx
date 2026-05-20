import { fireEvent, render, screen } from '@testing-library/react'

import ImageInput from '@/src/components/common/inputs/ImageInput'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

jest.mock('@/src/components/common/icons', () => ({
  IcUpload: () => <svg data-testid="ic-upload" />,
  IcDelete: () => <svg data-testid="ic-delete" />,
}))

// jsdom은 URL.createObjectURL을 구현하지 않으므로 mock 처리
beforeEach(() => {
  global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
})

afterEach(() => {
  jest.restoreAllMocks()
})

const selectImage = (input: Element) => {
  const file = new File(['image'], 'photo.png', { type: 'image/png' })
  Object.defineProperty(input, 'files', { value: [file], configurable: true })
  fireEvent.change(input)
  return file
}

it('초기 렌더 시 "이미지 첨부" 텍스트를 표시한다', () => {
  render(<ImageInput />)
  expect(screen.getByText('이미지 첨부')).toBeInTheDocument()
})

it('초기 렌더 시 파일 input이 존재한다', () => {
  const { container } = render(<ImageInput />)
  expect(container.querySelector('input[type="file"]')).toBeInTheDocument()
})

it('이미지 선택 시 미리보기 img를 렌더링한다', () => {
  const { container } = render(<ImageInput />)
  selectImage(container.querySelector('input[type="file"]')!)
  expect(screen.getByRole('img', { name: '선택된 이미지: photo.png' })).toBeInTheDocument()
})

it('이미지 선택 시 onFileChange가 파일과 함께 호출된다', () => {
  const onFileChange = jest.fn()
  const { container } = render(<ImageInput onFileChange={onFileChange} />)
  const file = selectImage(container.querySelector('input[type="file"]')!)
  expect(onFileChange).toHaveBeenCalledWith(file)
})

it('삭제 버튼 클릭 시 초기 상태로 돌아온다', () => {
  const { container } = render(<ImageInput />)
  selectImage(container.querySelector('input[type="file"]')!)
  fireEvent.click(screen.getByRole('button'))
  expect(screen.getByText('이미지 첨부')).toBeInTheDocument()
})

it('삭제 버튼 클릭 시 onFileChange(null)이 호출된다', () => {
  const onFileChange = jest.fn()
  const { container } = render(<ImageInput onFileChange={onFileChange} />)
  selectImage(container.querySelector('input[type="file"]')!)
  fireEvent.click(screen.getByRole('button'))
  expect(onFileChange).toHaveBeenLastCalledWith(null)
})
