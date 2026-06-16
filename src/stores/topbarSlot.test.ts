import { useTopbarSlotStore } from '@/src/stores/topbarSlot';

beforeEach(() => {
  useTopbarSlotStore.setState({ rightSlot: null });
});

it('초기 상태의 rightSlot은 null이다', () => {
  expect(useTopbarSlotStore.getState().rightSlot).toBeNull();
});

it('setRightSlot으로 노드를 등록할 수 있다', () => {
  const node = 'actions';
  useTopbarSlotStore.getState().setRightSlot(node);
  expect(useTopbarSlotStore.getState().rightSlot).toBe(node);
});

it('clearRightSlot은 rightSlot을 null로 되돌린다', () => {
  useTopbarSlotStore.getState().setRightSlot('actions');
  useTopbarSlotStore.getState().clearRightSlot();
  expect(useTopbarSlotStore.getState().rightSlot).toBeNull();
});

it('setRightSlot을 연속 호출하면 마지막 노드로 덮어쓴다', () => {
  useTopbarSlotStore.getState().setRightSlot('first');
  useTopbarSlotStore.getState().setRightSlot('second');
  expect(useTopbarSlotStore.getState().rightSlot).toBe('second');
});
