import { fireEvent, render, screen } from '@testing-library/react'

import EyeButton from '@/src/components/common/inputs/inputButtons/EyeButton'

jest.mock('@/src/components/common/icons', () => ({
  IcEye: () => <svg data-testid="ic-eye" />,
  IcEyeOff: () => <svg data-testid="ic-eye-off" />,
}))

it('초기 렌더 시 IcEyeOff 아이콘을 표시한다', () => {
  render(<EyeButton />)
  expect(screen.getByTestId('ic-eye-off')).toBeInTheDocument()
  expect(screen.queryByTestId('ic-eye')).not.toBeInTheDocument()
})

it('클릭 시 IcEye 아이콘으로 전환된다', () => {
  render(<EyeButton />)
  fireEvent.click(screen.getByRole('button'))
  expect(screen.getByTestId('ic-eye')).toBeInTheDocument()
  expect(screen.queryByTestId('ic-eye-off')).not.toBeInTheDocument()
})

it('두 번 클릭 시 IcEyeOff 아이콘으로 돌아온다', () => {
  render(<EyeButton />)
  fireEvent.click(screen.getByRole('button'))
  fireEvent.click(screen.getByRole('button'))
  expect(screen.getByTestId('ic-eye-off')).toBeInTheDocument()
})

it('onClick prop을 전달하면 클릭 시 호출된다', () => {
  const onClick = jest.fn()
  render(<EyeButton onClick={onClick} />)
  fireEvent.click(screen.getByRole('button'))
  expect(onClick).toHaveBeenCalledTimes(1)
})
