import { fireEvent, render, screen } from '@testing-library/react'

import NotificationItem, {
  type NotificationItemProps,
} from '@/src/components/notification/NotificationItem'
import type { Notification } from '@/src/types/notification'

// formatRelativeTime은 Date.now()를 사용하므로 고정 시각을 설정해 결과를 예측 가능하게 한다
const FIXED_NOW = new Date('2025-01-01T12:00:00.000Z')

beforeAll(() => {
  jest.useFakeTimers()
  jest.setSystemTime(FIXED_NOW)
})

afterAll(() => {
  jest.useRealTimers()
})

const BASE: Notification = {
  id: 1,
  teamId: 'team',
  userId: 1,
  type: 'deadline',
  message: '[할 일 제목]의 마감일이 하루 남았어요!',
  data: undefined,
  isRead: false,
  resourceId: 1,
  createdAt: new Date(FIXED_NOW.getTime() - 2 * 60_000).toISOString(), // 2분 전
}

function renderItem(overrides: Partial<NotificationItemProps> = {}) {
  return render(
    <ul>
      <NotificationItem notification={BASE} {...overrides} />
    </ul>,
  )
}

// ── 렌더링 ──────────────────────────────────────────────────────────────────

it('message를 표시한다', () => {
  renderItem()
  expect(screen.getByText(BASE.message)).toBeInTheDocument()
})

it('2분 경과 시 "2분 전"을 표시한다', () => {
  renderItem()
  expect(screen.getByText('2분 전')).toBeInTheDocument()
})

it('30분 경과 시 "30분 전"을 표시한다', () => {
  renderItem({
    notification: {
      ...BASE,
      createdAt: new Date(FIXED_NOW.getTime() - 30 * 60_000).toISOString(),
    },
  })
  expect(screen.getByText('30분 전')).toBeInTheDocument()
})

it('3시간 경과 시 "3시간 전"을 표시한다', () => {
  renderItem({
    notification: {
      ...BASE,
      createdAt: new Date(FIXED_NOW.getTime() - 3 * 3_600_000).toISOString(),
    },
  })
  expect(screen.getByText('3시간 전')).toBeInTheDocument()
})

it('3일 경과 시 "3일 전"을 표시한다', () => {
  renderItem({
    notification: {
      ...BASE,
      createdAt: new Date(FIXED_NOW.getTime() - 3 * 86_400_000).toISOString(),
    },
  })
  expect(screen.getByText('3일 전')).toBeInTheDocument()
})

it('2주 경과 시 "2주 전"을 표시한다', () => {
  renderItem({
    notification: {
      ...BASE,
      createdAt: new Date(FIXED_NOW.getTime() - 14 * 86_400_000).toISOString(),
    },
  })
  expect(screen.getByText('2주 전')).toBeInTheDocument()
})

it('subtext가 있으면 표시한다', () => {
  renderItem({ subtext: '"댓글 내용입니다"' })
  expect(screen.getByText('"댓글 내용입니다"')).toBeInTheDocument()
})

it('subtext prop이 없으면 p 요소가 message와 timestamp 2개뿐이다', () => {
  const { container } = renderItem()
  expect(container.querySelectorAll('p')).toHaveLength(2)
})

// 아바타는 aria-hidden 컨테이너 안에 있으므로 container.querySelector로 DOM에 직접 접근한다
it('avatarUrl이 없으면 img를 렌더링하지 않는다', () => {
  const { container } = renderItem()
  expect(container.querySelector('img')).not.toBeInTheDocument()
})

it('avatarUrl이 있으면 alt가 빈 문자열인 img를 렌더링한다', () => {
  const { container } = renderItem({ avatarUrl: 'https://example.com/avatar.png' })
  const img = container.querySelector('img')
  expect(img).toBeInTheDocument()
  expect(img).toHaveAttribute('src', 'https://example.com/avatar.png')
  expect(img).toHaveAttribute('alt', '')
})

// ── 읽음 / 안읽음 상태 ──────────────────────────────────────────────────────

it('isRead가 false이면 인디케이터에 before:bg-indigo-500 클래스가 있다', () => {
  renderItem({ onClick: jest.fn() })
  const indicator = screen.getByRole('button').querySelector('span[aria-hidden="true"]')
  expect(indicator).toHaveClass('before:bg-indigo-500')
  expect(indicator).not.toHaveClass('before:opacity-0')
})

it('isRead가 true이면 인디케이터에 before:opacity-0 클래스가 있다', () => {
  renderItem({ notification: { ...BASE, isRead: true }, onClick: jest.fn() })
  const indicator = screen.getByRole('button').querySelector('span[aria-hidden="true"]')
  expect(indicator).toHaveClass('before:opacity-0')
  expect(indicator).not.toHaveClass('before:bg-indigo-500')
})

it('isRead가 false이면 aria-label에 "읽지 않은 알림:" 접두어가 포함된다', () => {
  renderItem({ onClick: jest.fn() })
  expect(
    screen.getByRole('button', { name: `읽지 않은 알림: ${BASE.message}` }),
  ).toBeInTheDocument()
})

it('isRead가 true이면 aria-label이 message와 같다', () => {
  renderItem({ notification: { ...BASE, isRead: true }, onClick: jest.fn() })
  expect(screen.getByRole('button', { name: BASE.message })).toBeInTheDocument()
})

// ── onClick 인터랙션 ─────────────────────────────────────────────────────────

it('onClick이 없으면 role="button"이 설정되지 않는다', () => {
  renderItem()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

it('onClick이 있으면 role="button"과 tabIndex={0}이 설정된다', () => {
  renderItem({ onClick: jest.fn() })
  expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0')
})

it('클릭 시 notification 객체를 인자로 onClick이 호출된다', () => {
  const onClick = jest.fn()
  renderItem({ onClick })
  fireEvent.click(screen.getByRole('button'))
  expect(onClick).toHaveBeenCalledTimes(1)
  expect(onClick).toHaveBeenCalledWith(BASE)
})

it('Enter 키 입력 시 onClick이 호출된다', () => {
  const onClick = jest.fn()
  renderItem({ onClick })
  fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })
  expect(onClick).toHaveBeenCalledTimes(1)
})

it('Space 키 입력 시 onClick이 호출된다', () => {
  const onClick = jest.fn()
  renderItem({ onClick })
  fireEvent.keyDown(screen.getByRole('button'), { key: ' ' })
  expect(onClick).toHaveBeenCalledTimes(1)
})

it('다른 키 입력 시 onClick이 호출되지 않는다', () => {
  const onClick = jest.fn()
  renderItem({ onClick })
  fireEvent.keyDown(screen.getByRole('button'), { key: 'Escape' })
  expect(onClick).not.toHaveBeenCalled()
})
