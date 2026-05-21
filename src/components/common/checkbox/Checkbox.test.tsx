import { fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'

import Checkbox from '@/src/components/common/checkbox/Checkbox'

it('renders an unchecked checkbox by default', () => {
  render(<Checkbox aria-label="동의" />)
  expect(screen.getByRole('checkbox')).not.toBeChecked()
})

it('toggles when clicked (uncontrolled)', () => {
  render(<Checkbox aria-label="동의" />)
  const input = screen.getByRole('checkbox')
  fireEvent.click(input)
  expect(input).toBeChecked()
})

it('reflects the controlled checked prop and fires onChange on click', () => {
  const onChange = jest.fn()
  render(<Checkbox aria-label="동의" checked onChange={onChange} />)
  const input = screen.getByRole('checkbox')
  expect(input).toBeChecked()
  fireEvent.click(input)
  expect(onChange).toHaveBeenCalledTimes(1)
})

it('marks the input disabled when disabled is passed', () => {
  // 실제 토글 차단은 native input/브라우저 동작 — fireEvent는 jsdom에서 disabled
  // 가드를 거치지 않으므로, 컴포넌트가 책임지는 부분(disabled 속성 전달)만 검증한다.
  render(<Checkbox aria-label="동의" disabled />)
  expect(screen.getByRole('checkbox')).toBeDisabled()
})

it('renders children as a label and toggles the input when the label is clicked', () => {
  render(<Checkbox>이용약관 동의</Checkbox>)
  const input = screen.getByRole('checkbox', { name: '이용약관 동의' })
  fireEvent.click(screen.getByText('이용약관 동의'))
  expect(input).toBeChecked()
})

it('renders the primary variant icon by default (white check stroke)', () => {
  const { container } = render(<Checkbox aria-label="동의" />)
  expect(
    container.querySelector('path[stroke="var(--color-white)"]'),
  ).toBeInTheDocument()
})

it('renders the white variant icon when variant="white" (indigo-600 check stroke)', () => {
  const { container } = render(<Checkbox aria-label="동의" variant="white" />)
  expect(
    container.querySelector('path[stroke="var(--color-indigo-600)"]'),
  ).toBeInTheDocument()
})

it('forwards ref to the underlying input (react-hook-form compat)', () => {
  const ref = createRef<HTMLInputElement>()
  render(<Checkbox aria-label="동의" ref={ref} />)
  expect(ref.current).toBe(screen.getByRole('checkbox'))
  expect(ref.current?.tagName).toBe('INPUT')
})

it('applies the style prop to the label wrapper, not the hidden input', () => {
  render(<Checkbox aria-label="동의" style={{ marginTop: 10 }} />)
  const input = screen.getByRole('checkbox')
  expect(input.closest('label')).toHaveStyle({ marginTop: '10px' })
  expect(input).not.toHaveStyle({ marginTop: '10px' })
})

it('marks the decorative icons aria-hidden', () => {
  const { container } = render(<Checkbox aria-label="동의" />)
  const svgs = container.querySelectorAll('svg')
  expect(svgs).toHaveLength(2)
  svgs.forEach((svg) => expect(svg).toHaveAttribute('aria-hidden', 'true'))
})

it('uses the default slate label text for both variants (색은 소비 측이 선택)', () => {
  const { rerender } = render(<Checkbox>primary 라벨</Checkbox>)
  expect(screen.getByText('primary 라벨').closest('label')?.className).toMatch(
    /text-slate-700/,
  )
  rerender(<Checkbox variant="white">white 라벨</Checkbox>)
  expect(screen.getByText('white 라벨').closest('label')?.className).toMatch(
    /text-slate-700/,
  )
})
