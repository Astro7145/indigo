import { render, screen } from '@testing-library/react';

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
