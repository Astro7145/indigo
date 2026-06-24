import { fireEvent, render, screen } from '@testing-library/react';

import TodoAddButton from '@/src/components/common/sidebar/TodoAddButton';

it('클릭하면 onClick이 호출된다 — N 단축키는 useNewTodoShortcut 소관', () => {
  const onClick = jest.fn();
  render(<TodoAddButton onClick={onClick} />);
  fireEvent.keyDown(window, { key: 'n' });
  expect(onClick).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button'));
  expect(onClick).toHaveBeenCalledTimes(1);
});
