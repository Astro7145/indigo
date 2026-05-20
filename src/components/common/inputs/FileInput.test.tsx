import { fireEvent, render, screen } from '@testing-library/react'

import FileInput from '@/src/components/common/inputs/FileInput'

jest.mock('@/src/components/common/icons', () => ({
  IcUpload: () => <svg data-testid="ic-upload" />,
  IcDelete: () => <svg data-testid="ic-delete" />,
}))

const selectFile = (input: Element, file: File) => {
  Object.defineProperty(input, 'files', { value: [file], configurable: true })
  fireEvent.change(input)
}

const cancelFileDialog = (input: Element) => {
  Object.defineProperty(input, 'files', { value: [], configurable: true })
  fireEvent.change(input)
}

it('초기 렌더 시 "파일을 선택해주세요" 텍스트를 표시한다', () => {
  render(<FileInput />)
  expect(screen.getByText('파일을 선택해주세요')).toBeInTheDocument()
})

it('파일이 없을 때 삭제 버튼을 렌더링하지 않는다', () => {
  render(<FileInput />)
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

it('파일 선택 시 파일명을 표시한다', () => {
  const { container } = render(<FileInput />)
  selectFile(container.querySelector('input[type="file"]')!, new File([''], 'test.txt'))
  expect(screen.getByText('test.txt')).toBeInTheDocument()
})

it('파일 선택 시 onFileChange가 파일과 함께 호출된다', () => {
  const onFileChange = jest.fn()
  const { container } = render(<FileInput onFileChange={onFileChange} />)
  const file = new File([''], 'test.txt')
  selectFile(container.querySelector('input[type="file"]')!, file)
  expect(onFileChange).toHaveBeenCalledWith(file)
})

it('파일 선택 후 삭제 버튼이 표시된다', () => {
  const { container } = render(<FileInput />)
  selectFile(container.querySelector('input[type="file"]')!, new File([''], 'test.txt'))
  expect(screen.getByRole('button')).toBeInTheDocument()
})

it('삭제 버튼 클릭 시 초기 텍스트로 돌아온다', () => {
  const { container } = render(<FileInput />)
  selectFile(container.querySelector('input[type="file"]')!, new File([''], 'test.txt'))
  fireEvent.click(screen.getByRole('button'))
  expect(screen.getByText('파일을 선택해주세요')).toBeInTheDocument()
})

it('삭제 버튼 클릭 시 onFileChange(null)이 호출된다', () => {
  const onFileChange = jest.fn()
  const { container } = render(<FileInput onFileChange={onFileChange} />)
  selectFile(container.querySelector('input[type="file"]')!, new File([''], 'test.txt'))
  fireEvent.click(screen.getByRole('button'))
  expect(onFileChange).toHaveBeenLastCalledWith(null)
})

it('파일 선택 후 탐색기를 취소하면 기존 파일이 유지된다', () => {
  const { container } = render(<FileInput />)
  const input = container.querySelector('input[type="file"]')!
  selectFile(input, new File([''], 'test.txt'))
  cancelFileDialog(input)
  expect(screen.getByText('test.txt')).toBeInTheDocument()
})

it('파일 선택 후 탐색기를 취소하면 onFileChange가 추가로 호출되지 않는다', () => {
  const onFileChange = jest.fn()
  const { container } = render(<FileInput onFileChange={onFileChange} />)
  const input = container.querySelector('input[type="file"]')!
  selectFile(input, new File([''], 'test.txt'))
  cancelFileDialog(input)
  expect(onFileChange).toHaveBeenCalledTimes(1)
})
