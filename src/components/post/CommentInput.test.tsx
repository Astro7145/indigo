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
