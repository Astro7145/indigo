import { render, screen } from '@testing-library/react'

import ToastPortal from '@/src/components/_common/portals/ToastPortal'

it('#toast-portal이 없으면 아무것도 렌더링하지 않는다', () => {
  render(
    <ToastPortal>
      <span>내용</span>
    </ToastPortal>,
  )
  expect(screen.queryByText('내용')).not.toBeInTheDocument()
})

it('#toast-portal이 있으면 children을 포탈에 렌더링한다', () => {
  const portalRoot = document.createElement('div')
  portalRoot.setAttribute('id', 'toast-portal')
  document.body.appendChild(portalRoot)

  render(
    <ToastPortal>
      <span>포탈 내용</span>
    </ToastPortal>,
  )
  expect(screen.getByText('포탈 내용')).toBeInTheDocument()

  document.body.removeChild(portalRoot)
})
