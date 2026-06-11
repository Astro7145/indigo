import { fireEvent, render, screen } from '@testing-library/react';

import TodoAddButton from '@/src/components/common/sidebar/TodoAddButton';

it('shortcut이 켜져 있으면 N 키로 onClick이 호출된다', () => {
  const onClick = jest.fn();
  render(<TodoAddButton onClick={onClick} shortcut />);
  fireEvent.keyDown(window, { key: 'n' });
  expect(onClick).toHaveBeenCalledTimes(1);
});

it('shortcut이 없으면 N 키에 반응하지 않는다 — 클릭만 동작', () => {
  const onClick = jest.fn();
  render(<TodoAddButton onClick={onClick} />);
  fireEvent.keyDown(window, { key: 'n' });
  expect(onClick).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button'));
  expect(onClick).toHaveBeenCalledTimes(1);
});

it('입력 중에는 N 단축키가 동작하지 않는다', () => {
  const onClick = jest.fn();
  render(
    <>
      <input aria-label="field" />
      <TodoAddButton onClick={onClick} shortcut />
    </>,
  );
  const input = screen.getByLabelText('field');
  input.focus();
  fireEvent.keyDown(input, { key: 'n' });
  expect(onClick).not.toHaveBeenCalled();
});
