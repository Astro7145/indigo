import { fireEvent, render, screen } from '@testing-library/react';

import Modal from '@/src/components/common/modal/Modal';
import TodoExitConfirm from '@/src/components/todo/TodoExitConfirm';

// Modal.Title/Actions/Cancel/Confirm은 Modal 컨텍스트가 필요하므로 shell로 감싼다(ModalStack과 동일한 구동 조건).
function renderInModal(ui: React.ReactNode) {
  return render(
    <Modal open onClose={() => {}}>
      {ui}
    </Modal>,
  );
}

it('이탈 확인 문구를 보여준다', () => {
  renderInModal(<TodoExitConfirm onStay={() => {}} onLeave={() => {}} />);
  expect(screen.getByRole('heading', { name: '정말 나가시겠어요?' })).toBeInTheDocument();
  expect(screen.getByText('작성 중인 내용이 사라집니다.')).toBeInTheDocument();
});

it('"아니오"를 누르면 머무르기(onStay)를 호출한다', () => {
  const onStay = jest.fn();
  renderInModal(<TodoExitConfirm onStay={onStay} onLeave={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: '아니오' }));
  expect(onStay).toHaveBeenCalledTimes(1);
});

it('"예"를 누르면 나가기(onLeave)를 호출한다', () => {
  const onLeave = jest.fn();
  renderInModal(<TodoExitConfirm onStay={() => {}} onLeave={onLeave} />);
  fireEvent.click(screen.getByRole('button', { name: '예' }));
  expect(onLeave).toHaveBeenCalledTimes(1);
});
