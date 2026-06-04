import { fireEvent, render, screen } from '@testing-library/react';

import SearchButton from '@/src/components/common/inputs/inputButtons/SearchButton';

jest.mock('@/src/components/common/icons', () => ({
  IcSearch: () => <svg data-testid="ic-search" />,
}));

it('검색 버튼을 렌더링한다', () => {
  render(<SearchButton />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});

it('검색 아이콘을 표시한다', () => {
  render(<SearchButton />);
  expect(screen.getByTestId('ic-search')).toBeInTheDocument();
});

it('onClick prop을 전달하면 클릭 시 호출된다', () => {
  const onClick = jest.fn();
  render(<SearchButton onClick={onClick} />);
  fireEvent.click(screen.getByRole('button'));
  expect(onClick).toHaveBeenCalledTimes(1);
});

it('onClick prop 없이도 에러 없이 렌더링된다', () => {
  expect(() => render(<SearchButton />)).not.toThrow();
});
