import { act, renderHook } from '@testing-library/react'

import { useToast } from '@/src/hooks/useToast'
import { useToastStore } from '@/src/stores/toast'

beforeEach(() => {
  jest.useFakeTimers()
  useToastStore.setState({ isOpen: false, message: '' })
})

afterEach(() => {
  jest.useRealTimers()
})

it('showToast를 호출하면 isOpen이 true가 되고 message가 설정된다', () => {
  const { result } = renderHook(() => useToast())
  act(() => result.current.showToast('저장 완료'))
  expect(useToastStore.getState().isOpen).toBe(true)
  expect(useToastStore.getState().message).toBe('저장 완료')
})

it('기본 duration(3초) 후 자동으로 isOpen이 false가 된다', () => {
  const { result } = renderHook(() => useToast())
  act(() => result.current.showToast('저장 완료'))
  act(() => jest.advanceTimersByTime(3000))
  expect(useToastStore.getState().isOpen).toBe(false)
})

it('duration 경과 이전에는 isOpen이 true로 유지된다', () => {
  const { result } = renderHook(() => useToast())
  act(() => result.current.showToast('저장 완료'))
  act(() => jest.advanceTimersByTime(2999))
  expect(useToastStore.getState().isOpen).toBe(true)
})

it('showToast를 연속 호출하면 타이머가 리셋되어 마지막 호출 기준으로 dismiss된다', () => {
  const { result } = renderHook(() => useToast()) // duration = 3000
  act(() => result.current.showToast('첫 번째'))
  act(() => jest.advanceTimersByTime(2000)) // 첫 번째 타이머 1초 남음
  act(() => result.current.showToast('두 번째')) // 타이머 리셋
  act(() => jest.advanceTimersByTime(1000)) // 원래 첫 번째가 dismiss될 시점, 아직 표시 중이어야 함
  expect(useToastStore.getState().isOpen).toBe(true)
  expect(useToastStore.getState().message).toBe('두 번째')
  act(() => jest.advanceTimersByTime(2000)) // 두 번째 타이머 만료
  expect(useToastStore.getState().isOpen).toBe(false)
})

it('hideToast를 호출하면 즉시 닫힌다', () => {
  const { result } = renderHook(() => useToast())
  act(() => result.current.showToast('저장 완료'))
  act(() => result.current.hideToast())
  expect(useToastStore.getState().isOpen).toBe(false)
})

it('커스텀 duration을 지정하면 해당 시간 후 닫힌다', () => {
  const { result } = renderHook(() => useToast(1000))
  act(() => result.current.showToast('저장 완료'))
  act(() => jest.advanceTimersByTime(999))
  expect(useToastStore.getState().isOpen).toBe(true)
  act(() => jest.advanceTimersByTime(1))
  expect(useToastStore.getState().isOpen).toBe(false)
})

it('언마운트 시 타이머가 정리되어 자동 dismiss가 실행되지 않는다', () => {
  const { result, unmount } = renderHook(() => useToast())
  act(() => result.current.showToast('저장 완료'))
  unmount()
  act(() => jest.runAllTimers())
  // clearTimeout으로 타이머가 제거됐으므로 hide()가 호출되지 않아 isOpen이 true 유지
  expect(useToastStore.getState().isOpen).toBe(true)
})
