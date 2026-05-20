import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import EyeButton from '@/src/components/common/inputs/inputButtons/EyeButton'

jest.mock('@/src/components/common/icons', () => ({
  IcEye: () => <svg data-testid="ic-eye" />,
  IcEyeOff: () => <svg data-testid="ic-eye-off" />,
}))

// EyeButton은 제어 컴포넌트 — hide 상태를 부모에서 관리한다.
// 토글 동작을 테스트하기 위해 내부 상태를 가진 래퍼를 사용한다.
function EyeButtonWrapper({ initialHide = true }: { initialHide?: boolean }) {
  const [hide, setHide] = useState(initialHide)
  return <EyeButton hide={hide} onClick={() => setHide((h) => !h)} />
}

it('hide={true}이면 IcEyeOff 아이콘을 표시한다', () => {
  render(<EyeButton hide={true} />)
  expect(screen.getByTestId('ic-eye-off')).toBeInTheDocument()
  expect(screen.queryByTestId('ic-eye')).not.toBeInTheDocument()
})

it('hide={false}이면 IcEye 아이콘을 표시한다', () => {
  render(<EyeButton hide={false} />)
  expect(screen.getByTestId('ic-eye')).toBeInTheDocument()
  expect(screen.queryByTestId('ic-eye-off')).not.toBeInTheDocument()
})

it('클릭 시 IcEye 아이콘으로 전환된다', () => {
  render(<EyeButtonWrapper />)
  fireEvent.click(screen.getByRole('button'))
  expect(screen.getByTestId('ic-eye')).toBeInTheDocument()
  expect(screen.queryByTestId('ic-eye-off')).not.toBeInTheDocument()
})

it('두 번 클릭 시 IcEyeOff 아이콘으로 돌아온다', () => {
  render(<EyeButtonWrapper />)
  fireEvent.click(screen.getByRole('button'))
  fireEvent.click(screen.getByRole('button'))
  expect(screen.getByTestId('ic-eye-off')).toBeInTheDocument()
})

it('onClick prop을 전달하면 클릭 시 호출된다', () => {
  const onClick = jest.fn()
  render(<EyeButton hide={true} onClick={onClick} />)
  fireEvent.click(screen.getByRole('button'))
  expect(onClick).toHaveBeenCalledTimes(1)
})

it('hide={true}이면 aria-label이 "비밀번호 표시"이다', () => {
  render(<EyeButton hide={true} />)
  expect(screen.getByRole('button')).toHaveAccessibleName('비밀번호 표시')
})

it('hide={false}이면 aria-label이 "비밀번호 숨기기"이다', () => {
  render(<EyeButton hide={false} />)
  expect(screen.getByRole('button')).toHaveAccessibleName('비밀번호 숨기기')
})

it('hide={true}이면 aria-pressed가 false이다', () => {
  render(<EyeButton hide={true} />)
  expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
})

it('hide={false}이면 aria-pressed가 true이다', () => {
  render(<EyeButton hide={false} />)
  expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
})
