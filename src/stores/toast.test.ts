import { useToastStore } from '@/src/stores/toast'

beforeEach(() => {
  useToastStore.setState({ isOpen: false, message: '' })
})

it('초기 상태는 isOpen: false, message: ""', () => {
  const { isOpen, message } = useToastStore.getState()
  expect(isOpen).toBe(false)
  expect(message).toBe('')
})

it('show(message)를 호출하면 isOpen이 true가 되고 message가 설정된다', () => {
  useToastStore.getState().show('저장 완료')
  const { isOpen, message } = useToastStore.getState()
  expect(isOpen).toBe(true)
  expect(message).toBe('저장 완료')
})

it('hide()를 호출하면 isOpen이 false가 된다', () => {
  useToastStore.getState().show('저장 완료')
  useToastStore.getState().hide()
  expect(useToastStore.getState().isOpen).toBe(false)
})

it('hide()는 message를 초기화하지 않는다', () => {
  useToastStore.getState().show('저장 완료')
  useToastStore.getState().hide()
  expect(useToastStore.getState().message).toBe('저장 완료')
})

it('show()를 연속 호출하면 마지막 message로 덮어쓴다', () => {
  useToastStore.getState().show('첫 번째')
  useToastStore.getState().show('두 번째')
  expect(useToastStore.getState().message).toBe('두 번째')
  expect(useToastStore.getState().isOpen).toBe(true)
})
