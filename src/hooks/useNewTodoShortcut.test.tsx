import { fireEvent, render, screen } from '@testing-library/react';

import { useNewTodoShortcut } from '@/src/hooks/useNewTodoShortcut';

function Harness({ onTrigger }: { onTrigger: () => void }) {
  useNewTodoShortcut(onTrigger);
  return <input aria-label="field" />;
}

it('N 키로 onTrigger가 호출된다', () => {
  const onTrigger = jest.fn();
  render(<Harness onTrigger={onTrigger} />);
  fireEvent.keyDown(window, { key: 'n' });
  expect(onTrigger).toHaveBeenCalledTimes(1);
});

it('입력 중에는 단축키가 동작하지 않는다', () => {
  const onTrigger = jest.fn();
  render(<Harness onTrigger={onTrigger} />);
  const input = screen.getByLabelText('field');
  input.focus();
  fireEvent.keyDown(input, { key: 'n' });
  expect(onTrigger).not.toHaveBeenCalled();
});

it('조합키(meta/ctrl/alt)와 함께 누르면 동작하지 않는다', () => {
  const onTrigger = jest.fn();
  render(<Harness onTrigger={onTrigger} />);
  fireEvent.keyDown(window, { key: 'n', metaKey: true });
  expect(onTrigger).not.toHaveBeenCalled();
});
