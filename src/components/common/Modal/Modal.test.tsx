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

it('Modal.Actions는 자식을 렌더링한다', () => {
  render(
    <Modal open onClose={() => {}}>
      <Modal.Actions>
        <button>버튼A</button>
      </Modal.Actions>
    </Modal>,
  );
  expect(screen.getByRole('button', { name: '버튼A' })).toBeInTheDocument();
});

it('Modal.Cancel은 onClick이 없으면 close(onClose)를 호출한다', () => {
  const onClose = jest.fn();
  render(
    <Modal open onClose={onClose}>
      <Modal.Cancel>취소</Modal.Cancel>
    </Modal>,
  );
  fireEvent.click(screen.getByRole('button', { name: '취소' }));
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('Modal.Cancel은 onClick이 있으면 그 핸들러를 호출하고 자동으로 닫지 않는다', () => {
  const onClose = jest.fn();
  const onClick = jest.fn();
  render(
    <Modal open onClose={onClose}>
      <Modal.Cancel onClick={onClick}>취소</Modal.Cancel>
    </Modal>,
  );
  fireEvent.click(screen.getByRole('button', { name: '취소' }));
  expect(onClick).toHaveBeenCalledTimes(1);
  expect(onClose).not.toHaveBeenCalled();
});

it('Modal.Confirm은 onClick을 호출한다', () => {
  const onClick = jest.fn();
  render(
    <Modal open onClose={() => {}}>
      <Modal.Confirm onClick={onClick}>확인</Modal.Confirm>
    </Modal>,
  );
  fireEvent.click(screen.getByRole('button', { name: '확인' }));
  expect(onClick).toHaveBeenCalledTimes(1);
});

it('Modal.Title은 제목을 렌더링하고 컨테이너 aria-labelledby로 연결한다', () => {
  render(
    <Modal open onClose={() => {}}>
      <Modal.Title>정말 삭제하시겠어요?</Modal.Title>
    </Modal>,
  );
  const dialog = screen.getByRole('dialog');
  const title = screen.getByRole('heading', { name: '정말 삭제하시겠어요?' });
  expect(dialog).toHaveAttribute('aria-labelledby', title.id);
});

it('showCloseButton이 true이면 닫기 버튼을 렌더링하고 클릭 시 onClose를 호출한다', () => {
  const onClose = jest.fn();
  render(
    <Modal open showCloseButton onClose={onClose}>
      <p>내용</p>
    </Modal>,
  );
  fireEvent.click(screen.getByRole('button', { name: '닫기' }));
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('showCloseButton 기본값(false)이면 닫기 버튼이 없다', () => {
  render(
    <Modal open onClose={() => {}}>
      <p>내용</p>
    </Modal>,
  );
  expect(screen.queryByRole('button', { name: '닫기' })).not.toBeInTheDocument();
});

it('닫기 버튼의 아이콘은 aria-hidden으로 스크린리더에서 숨겨진다', () => {
  render(
    <Modal open showCloseButton onClose={() => {}}>
      <p>내용</p>
    </Modal>,
  );
  const closeButton = screen.getByRole('button', { name: '닫기' });
  expect(closeButton.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
});

it('showCloseButton이 있어도 열릴 때 포커스는 닫기 버튼이 아닌 콘텐츠로 간다', () => {
  render(
    <Modal open showCloseButton onClose={() => {}}>
      <button data-testid="inside">내부</button>
    </Modal>,
  );
  expect(screen.getByTestId('inside')).toHaveFocus();
  expect(screen.getByRole('button', { name: '닫기' })).not.toHaveFocus();
});

it('showCloseButton이면 헤더형 대칭 패딩(p-8)을 적용한다', () => {
  render(
    <Modal open showCloseButton onClose={() => {}}>
      <p>내용</p>
    </Modal>,
  );
  const dialog = screen.getByRole('dialog');
  expect(dialog).toHaveClass('p-8');
  expect(dialog).not.toHaveClass('pt-16');
});

it('showCloseButton이 없으면 센터형 패딩(pt-16)을 적용한다', () => {
  render(
    <Modal open onClose={() => {}}>
      <p>내용</p>
    </Modal>,
  );
  const dialog = screen.getByRole('dialog');
  expect(dialog).toHaveClass('pt-16');
  expect(dialog).not.toHaveClass('p-8');
});
