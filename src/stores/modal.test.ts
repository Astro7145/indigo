import { useModalStore } from '@/src/stores/modal';

beforeEach(() => {
  useModalStore.setState({ modals: [] });
});

it('초기 상태의 modals는 빈 배열이다', () => {
  expect(useModalStore.getState().modals).toEqual([]);
});

it('open()을 호출하면 modals에 엔트리가 하나 쌓인다', () => {
  useModalStore.getState().open(() => null);
  expect(useModalStore.getState().modals).toHaveLength(1);
});

it('나중에 연 엔트리가 배열 마지막(top)에 온다', () => {
  const first = () => null;
  const second = () => null;
  useModalStore.getState().open(first);
  useModalStore.getState().open(second);
  const { modals } = useModalStore.getState();
  expect(modals[0].render).toBe(first);
  expect(modals[1].render).toBe(second);
});

it('options를 생략하면 variant는 auto, onClose는 미지정이 기본값이다', () => {
  useModalStore.getState().open(() => null);
  const entry = useModalStore.getState().modals[0];
  expect(entry.variant).toBe('auto');
  expect(entry.onClose).toBeUndefined();
});

it('options로 전달한 값이 엔트리에 반영된다', () => {
  const onClose = jest.fn();
  useModalStore.getState().open(() => null, {
    variant: 'modal',
    onClose,
    className: 'w-[400px]',
  });
  const entry = useModalStore.getState().modals[0];
  expect(entry.variant).toBe('modal');
  expect(entry.onClose).toBe(onClose);
  expect(entry.className).toBe('w-[400px]');
});

it('render 함수가 엔트리에 보존돼 controls와 함께 호출할 수 있다', () => {
  const render = jest.fn(() => null);
  useModalStore.getState().open(render);
  const entry = useModalStore.getState().modals[0];
  const controls = { close: jest.fn(), closeWithParent: jest.fn() };
  entry.render(controls);
  expect(render).toHaveBeenCalledWith(controls);
});

it('close()는 맨 위(마지막) 엔트리만 제거한다', () => {
  const first = () => null;
  const second = () => null;
  useModalStore.getState().open(first);
  useModalStore.getState().open(second);
  useModalStore.getState().close();
  const { modals } = useModalStore.getState();
  expect(modals).toHaveLength(1);
  expect(modals[0].render).toBe(first);
});

it('closeWithParent()는 맨 위와 그 아래(위 2개) 엔트리를 함께 제거한다', () => {
  useModalStore.getState().open(() => null); // 부모
  useModalStore.getState().open(() => null); // 자식(확인창)
  useModalStore.getState().closeWithParent();
  expect(useModalStore.getState().modals).toHaveLength(0);
});

it('스택에 하나만 있을 때 closeWithParent()는 그 하나를 제거해 비운다', () => {
  useModalStore.getState().open(() => null);
  useModalStore.getState().closeWithParent();
  expect(useModalStore.getState().modals).toHaveLength(0);
});

it('아래에 다른 모달이 있을 때 closeWithParent()는 위 2개만 제거하고 맨 아래는 남긴다', () => {
  const bottom = () => null;
  useModalStore.getState().open(bottom);
  useModalStore.getState().open(() => null);
  useModalStore.getState().open(() => null);
  useModalStore.getState().closeWithParent();
  const { modals } = useModalStore.getState();
  expect(modals).toHaveLength(1);
  expect(modals[0].render).toBe(bottom);
});
