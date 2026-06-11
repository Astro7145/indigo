import { act, fireEvent, render, screen } from '@testing-library/react';

import CommentInput from '@/src/components/post/CommentInput';

it('빈 입력이면 등록 버튼이 비활성화된다', () => {
  render(<CommentInput />);
  expect(screen.getByRole('button', { name: '등록' })).toBeDisabled();
});

it('등록 시 onSubmit은 (text, clearInput)으로 호출되며 clearInput 호출 전까지는 입력을 보존한다', () => {
  const onSubmit = jest.fn();
  render(<CommentInput onSubmit={onSubmit} />);
  const input = screen.getByLabelText('댓글 입력');
  fireEvent.change(input, { target: { value: '안녕하세요' } });
  fireEvent.click(screen.getByRole('button', { name: '등록' }));

  expect(onSubmit).toHaveBeenCalledWith('안녕하세요', expect.any(Function));
  // 등록 직후엔 비우지 않음 — 서버 성공 시점에만 상위가 clearInput을 호출하기 때문
  expect(input).toHaveValue('안녕하세요');

  const clearInput = onSubmit.mock.calls[0][1] as () => void;
  act(() => clearInput());
  expect(input).toHaveValue('');
});

it('Enter 키 입력 시 onSubmit이 호출된다', () => {
  const onSubmit = jest.fn();
  render(<CommentInput onSubmit={onSubmit} />);
  const input = screen.getByLabelText('댓글 입력');
  fireEvent.change(input, { target: { value: '엔터로 등록' } });
  fireEvent.keyDown(input, { key: 'Enter' });

  expect(onSubmit).toHaveBeenCalledWith('엔터로 등록', expect.any(Function));
});

it('Shift+Enter 입력 시 onSubmit이 호출되지 않는다 (개행 동작 보존)', () => {
  const onSubmit = jest.fn();
  render(<CommentInput onSubmit={onSubmit} />);
  const input = screen.getByLabelText('댓글 입력');
  fireEvent.change(input, { target: { value: '한 줄' } });
  fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });

  expect(onSubmit).not.toHaveBeenCalled();
});

it('IME 조합 중 Enter는 한글 확정용이므로 onSubmit이 호출되지 않는다', () => {
  const onSubmit = jest.fn();
  render(<CommentInput onSubmit={onSubmit} />);
  const input = screen.getByLabelText('댓글 입력');
  fireEvent.change(input, { target: { value: '한글' } });
  // KeyboardEvent의 isComposing은 init 인자로 못 받아 defineProperty로 직접 셋팅
  const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
  Object.defineProperty(event, 'isComposing', { value: true });
  input.dispatchEvent(event);

  expect(onSubmit).not.toHaveBeenCalled();
});

it('빈 입력 상태에서 Enter를 눌러도 onSubmit이 호출되지 않는다', () => {
  const onSubmit = jest.fn();
  render(<CommentInput onSubmit={onSubmit} />);
  const input = screen.getByLabelText('댓글 입력');
  fireEvent.keyDown(input, { key: 'Enter' });

  expect(onSubmit).not.toHaveBeenCalled();
});

it('disabled=true면 입력창·버튼이 비활성화되고 Enter·클릭으로 onSubmit이 호출되지 않는다', () => {
  const onSubmit = jest.fn();
  render(<CommentInput onSubmit={onSubmit} disabled />);
  const input = screen.getByLabelText('댓글 입력');
  const button = screen.getByRole('button', { name: '등록' });

  expect(input).toBeDisabled();
  expect(button).toBeDisabled();

  // 클릭/Enter 모두 통과 안 됨 (textarea가 disabled여서 onChange도 안 일어나지만, 가드 자체 검증을 위해 강제 변경)
  fireEvent.change(input, { target: { value: '시도' } });
  fireEvent.click(button);
  fireEvent.keyDown(input, { key: 'Enter' });

  expect(onSubmit).not.toHaveBeenCalled();
});
