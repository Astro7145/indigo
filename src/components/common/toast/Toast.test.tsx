import { act, render, screen } from '@testing-library/react'
import type { ComponentProps, ReactNode } from 'react'

import Toast from '@/src/components/common/toast/Toast'
import { useToastStore } from '@/src/stores/toast'

// AnimatePresence가 exit 애니메이션 동안 DOM을 유지하면 즉시 제거를 검증할 수 없으므로
// 테스트에서는 애니메이션 없이 children을 그대로 렌더링하도록 mock
jest.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: {
    div: ({
      children,
      ...rest
    }: ComponentProps<'div'> & Record<string, unknown>) => (
      <div {...(rest as ComponentProps<'div'>)}>{children as ReactNode}</div>
    ),
  },
}))

beforeEach(() => {
  useToastStore.setState({ isOpen: false, message: '' })
  const portalRoot = document.createElement('div')
  portalRoot.setAttribute('id', 'toast-portal')
  document.body.appendChild(portalRoot)
})

afterEach(() => {
  document.getElementById('toast-portal')?.remove()
})

it('isOpen이 false이면 아무것도 렌더링하지 않는다', () => {
  render(<Toast />)
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  expect(document.getElementById('toast-portal')?.children).toHaveLength(0)
})

it('isOpen이 true이면 message를 렌더링한다', () => {
  useToastStore.setState({ isOpen: true, message: '저장 완료' })
  render(<Toast />)
  expect(screen.getByText('저장 완료')).toBeInTheDocument()
})

it('isOpen이 true이면 포탈 내부에 렌더링한다', () => {
  useToastStore.setState({ isOpen: true, message: '저장 완료' })
  render(<Toast />)
  const portal = document.getElementById('toast-portal')
  expect(portal).toContainElement(screen.getByText('저장 완료'))
})

it('스토어가 hide 상태로 변경되면 토스트가 사라진다', () => {
  useToastStore.setState({ isOpen: true, message: '저장 완료' })
  render(<Toast />)
  expect(screen.getByText('저장 완료')).toBeInTheDocument()
  act(() => {
    useToastStore.setState({ isOpen: false })
  })
  expect(screen.queryByText('저장 완료')).not.toBeInTheDocument()
})
