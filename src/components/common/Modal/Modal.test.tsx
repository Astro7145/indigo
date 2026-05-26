import { fireEvent, render, screen } from '@testing-library/react';

import Modal from '@/src/components/common/Modal/Modal';

it('open이 true이면 children을 렌더링한다', () => {
  render(
    <Modal open onClose={() => {}}>
      <p>모달 내용</p>
    </Modal>,
  );
  expect(screen.getByText('모달 내용')).toBeInTheDocument();
});

it('open이 false이면 아무것도 렌더링하지 않는다', () => {
  render(
    <Modal open={false} onClose={() => {}}>
      <p>모달 내용</p>
    </Modal>,
  );
  expect(screen.queryByText('모달 내용')).not.toBeInTheDocument();
});

it('role=dialog와 aria-modal=true를 가진다', () => {
  render(
    <Modal open onClose={() => {}}>
      <p>내용</p>
    </Modal>,
  );
  expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
});

it('document.body에 포탈로 렌더링한다', () => {
  render(
    <Modal open onClose={() => {}}>
      <p>내용</p>
    </Modal>,
  );
  expect(document.body).toContainElement(screen.getByRole('dialog'));
});

it('size=large면 large 너비 클래스를 적용한다', () => {
  render(
    <Modal open size="large" onClose={() => {}}>
      <p>내용</p>
    </Modal>,
  );
  expect(screen.getByRole('dialog')).toHaveClass('w-[456px]');
});

it('size=small면 small 너비 클래스를 적용한다', () => {
  render(
    <Modal open size="small" onClose={() => {}}>
      <p>내용</p>
    </Modal>,
  );
  expect(screen.getByRole('dialog')).toHaveClass('w-[343px]');
});

it('ref가 다이얼로그 컨테이너에 연결된다', () => {
  let node: HTMLDivElement | null = null;
  render(
    <Modal
      open
      ref={(el) => {
        node = el;
      }}
      onClose={() => {}}
    >
      <p>내용</p>
    </Modal>,
  );
  expect(node).toBe(screen.getByRole('dialog'));
});

it('ESC 키를 누르면 onClose를 호출한다', () => {
  const onClose = jest.fn();
  render(
    <Modal open onClose={onClose}>
      <p>내용</p>
    </Modal>,
  );
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('closeOnEsc=false이면 ESC를 무시한다', () => {
  const onClose = jest.fn();
  render(
    <Modal open closeOnEsc={false} onClose={onClose}>
      <p>내용</p>
    </Modal>,
  );
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(onClose).not.toHaveBeenCalled();
});

it('백드롭 클릭 시 onClose를 호출한다', () => {
  const onClose = jest.fn();
  render(
    <Modal open onClose={onClose}>
      <p>내용</p>
    </Modal>,
  );
  fireEvent.click(screen.getByTestId('modal-backdrop'));
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('모달 컨테이너 내부 클릭은 닫지 않는다', () => {
  const onClose = jest.fn();
  render(
    <Modal open onClose={onClose}>
      <p>내용</p>
    </Modal>,
  );
  fireEvent.click(screen.getByRole('dialog'));
  expect(onClose).not.toHaveBeenCalled();
});

it('closeOnBackdropClick=false이면 백드롭 클릭을 무시한다', () => {
  const onClose = jest.fn();
  render(
    <Modal open closeOnBackdropClick={false} onClose={onClose}>
      <p>내용</p>
    </Modal>,
  );
  fireEvent.click(screen.getByTestId('modal-backdrop'));
  expect(onClose).not.toHaveBeenCalled();
});

it('열리면 body 스크롤을 잠그고 닫히면 해제한다', () => {
  const { rerender } = render(
    <Modal open onClose={() => {}}>
      <p>내용</p>
    </Modal>,
  );
  expect(document.body.style.overflow).toBe('hidden');
  rerender(
    <Modal open={false} onClose={() => {}}>
      <p>내용</p>
    </Modal>,
  );
  expect(document.body.style.overflow).toBe('');
});

it('열릴 때 모달 내부 첫 포커서블로 포커스를 이동한다', () => {
  render(
    <Modal open onClose={() => {}}>
      <button data-testid="inside">내부</button>
    </Modal>,
  );
  expect(screen.getByTestId('inside')).toHaveFocus();
});

it('닫힐 때 트리거 요소로 포커스를 복귀시킨다', () => {
  function Harness({ open }: { open: boolean }) {
    return (
      <>
        <button data-testid="trigger">열기</button>
        <Modal open={open} onClose={() => {}}>
          <button data-testid="inside">내부</button>
        </Modal>
      </>
    );
  }
  const { rerender } = render(<Harness open={false} />);
  const trigger = screen.getByTestId('trigger');
  trigger.focus();
  expect(trigger).toHaveFocus();
  rerender(<Harness open />);
  expect(screen.getByTestId('inside')).toHaveFocus();
  rerender(<Harness open={false} />);
  expect(trigger).toHaveFocus();
});

it('Tab 포커스가 모달 내부를 벗어나지 않고 순환한다', () => {
  render(
    <Modal open onClose={() => {}}>
      <button data-testid="first">first</button>
      <button data-testid="last">last</button>
    </Modal>,
  );
  const first = screen.getByTestId('first');
  const last = screen.getByTestId('last');
  last.focus();
  fireEvent.keyDown(last, { key: 'Tab' });
  expect(first).toHaveFocus();
  first.focus();
  fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });
  expect(last).toHaveFocus();
});
