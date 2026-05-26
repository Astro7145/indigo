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
