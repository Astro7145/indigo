import { fireEvent, render, screen } from '@testing-library/react';

import CommentInput from '@/src/components/post/CommentInput';

it('빈 입력이면 등록 버튼이 비활성화된다', () => {
  render(<CommentInput />);
  expect(screen.getByRole('button', { name: '등록' })).toBeDisabled();
});

it('입력 후 등록하면 onSubmit을 호출하고 입력을 비운다', () => {
  const onSubmit = jest.fn();
  render(<CommentInput onSubmit={onSubmit} />);
  const input = screen.getByLabelText('댓글 입력');
  fireEvent.change(input, { target: { value: '안녕하세요' } });
  fireEvent.click(screen.getByRole('button', { name: '등록' }));

  expect(onSubmit).toHaveBeenCalledWith('안녕하세요');
  expect(input).toHaveValue('');
});
