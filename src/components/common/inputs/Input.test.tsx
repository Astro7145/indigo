import { fireEvent, render, screen } from '@testing-library/react'

import Input from '@/src/components/common/inputs/Input'

it('input 요소를 렌더링한다', () => {
  render(<Input />)
  expect(screen.getByRole('textbox')).toBeInTheDocument()
})

it('placeholder가 표시된다', () => {
  render(<Input placeholder="입력해주세요" />)
  expect(screen.getByPlaceholderText('입력해주세요')).toBeInTheDocument()
})

it('iconRight prop으로 전달된 요소가 렌더링된다', () => {
  render(<Input iconRight={<button>아이콘</button>} />)
  expect(screen.getByRole('button', { name: '아이콘' })).toBeInTheDocument()
})

it('컨테이너 클릭 시 input에 포커스가 간다', () => {
  render(<Input />)
  const input = screen.getByRole('textbox')
  fireEvent.click(input.parentElement!)
  expect(input).toHaveFocus()
})

it('onChange prop을 전달하면 입력 시 호출된다', () => {
  const onChange = jest.fn()
  render(<Input onChange={onChange} />)
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '테스트' } })
  expect(onChange).toHaveBeenCalledTimes(1)
})

it('disabled prop이 input에 적용된다', () => {
  render(<Input disabled />)
  expect(screen.getByRole('textbox')).toBeDisabled()
})

it('variant="error"이면 컨테이너에 error 클래스가 적용된다', () => {
  render(<Input variant="error" />)
  expect(screen.getByRole('textbox').parentElement).toHaveClass('border-destructive')
})

it('variant="default"이면 컨테이너에 기본 border 클래스가 적용된다', () => {
  render(<Input />)
  expect(screen.getByRole('textbox').parentElement).toHaveClass('border-slate-300')
})
