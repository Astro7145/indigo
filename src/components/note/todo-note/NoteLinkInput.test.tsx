import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

import Modal from '@/src/components/common/modal/Modal';

import NoteLinkInput from './NoteLinkInput';

// Modal.Title/Modal.Confirm은 ModalContext가 필요해 실제 <Modal> 안에서만 렌더할 수 있다
// (NoteDraftPrompt·NoteCancelConfirm과 동일한 제약).
function renderInModal(children: ReactNode) {
  return render(
    <Modal open onClose={() => {}}>
      {children}
    </Modal>,
  );
}

it('기존 링크가 있으면 입력창에 미리 채워진다', () => {
  renderInModal(<NoteLinkInput initialUrl="https://example.com" onConfirm={() => {}} onClose={() => {}} />);

  expect(screen.getByLabelText('링크 URL')).toHaveValue('https://example.com');
});

it('프로토콜 없이 입력해도 https://가 자동으로 붙어 확인 버튼이 활성화된다', () => {
  renderInModal(<NoteLinkInput initialUrl="" onConfirm={() => {}} onClose={() => {}} />);

  fireEvent.change(screen.getByLabelText('링크 URL'), { target: { value: 'example.com' } });

  expect(screen.queryByText('올바른 URL을 입력해주세요.')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '확인' })).toBeEnabled();
});

it('프로토콜 없이 입력하고 확인하면 onConfirm이 https://가 붙은 URL로 호출된다', () => {
  const onConfirm = jest.fn();
  renderInModal(<NoteLinkInput initialUrl="" onConfirm={onConfirm} onClose={() => {}} />);

  fireEvent.change(screen.getByLabelText('링크 URL'), { target: { value: 'example.com' } });
  fireEvent.click(screen.getByRole('button', { name: '확인' }));

  expect(onConfirm).toHaveBeenCalledWith('https://example.com');
});

it('올바른 URL 형식이 아니면 에러 문구가 뜨고 확인 버튼이 비활성화된다', () => {
  renderInModal(<NoteLinkInput initialUrl="" onConfirm={() => {}} onClose={() => {}} />);

  fireEvent.change(screen.getByLabelText('링크 URL'), { target: { value: 'not a url' } });

  expect(screen.getByText('올바른 URL을 입력해주세요.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '확인' })).toBeDisabled();
});

it('도메인 형태가 아닌 http://a 는 에러 문구가 뜨고 확인 버튼이 비활성화된다', () => {
  renderInModal(<NoteLinkInput initialUrl="" onConfirm={() => {}} onClose={() => {}} />);

  fireEvent.change(screen.getByLabelText('링크 URL'), { target: { value: 'http://a' } });

  expect(screen.getByText('올바른 URL을 입력해주세요.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '확인' })).toBeDisabled();
});

it('유효한 링크를 입력하고 확인하면 onConfirm이 해당 URL로 호출된다', () => {
  const onConfirm = jest.fn();
  renderInModal(<NoteLinkInput initialUrl="" onConfirm={onConfirm} onClose={() => {}} />);

  fireEvent.change(screen.getByLabelText('링크 URL'), { target: { value: 'https://example.com' } });
  fireEvent.click(screen.getByRole('button', { name: '확인' }));

  expect(onConfirm).toHaveBeenCalledWith('https://example.com');
});

it('입력이 비어 있으면 에러 없이 확인 버튼만 비활성화된다', () => {
  renderInModal(<NoteLinkInput initialUrl="" onConfirm={() => {}} onClose={() => {}} />);

  expect(screen.queryByText('올바른 URL을 입력해주세요.')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '확인' })).toBeDisabled();
});

it('닫기 버튼을 클릭하면 onClose가 호출된다', () => {
  const onClose = jest.fn();
  renderInModal(<NoteLinkInput initialUrl="" onConfirm={() => {}} onClose={onClose} />);

  fireEvent.click(screen.getByRole('button', { name: '닫기' }));

  expect(onClose).toHaveBeenCalled();
});
