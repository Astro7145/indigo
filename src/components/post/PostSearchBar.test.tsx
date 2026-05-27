jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useRouter: jest.fn(() => ({ replace: jest.fn() })),
  usePathname: jest.fn(() => '/posts'),
}));

import { fireEvent, render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import PostSearchBar from './PostSearchBar';

it('초기에는 정렬 옵션 드롭다운이 닫혀 있다', () => {
  render(<PostSearchBar />);
  expect(screen.queryByRole('menuitem', { name: '인기순' })).not.toBeInTheDocument();
});

it('정렬 셀렉터 클릭 시 옵션이 노출된다', () => {
  render(<PostSearchBar />);
  fireEvent.click(screen.getByRole('button', { name: /최신순/ }));
  expect(screen.getByRole('menuitem', { name: '최신순' })).toBeInTheDocument();
  expect(screen.getByRole('menuitem', { name: '인기순' })).toBeInTheDocument();
});

it('인기순 선택 시 sortBy=popular 파라미터를 URL에 반영하고 드롭다운이 닫힌다', () => {
  const replace = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({ replace });
  render(<PostSearchBar />);
  fireEvent.click(screen.getByRole('button', { name: /최신순/ }));
  fireEvent.click(screen.getByRole('menuitem', { name: '인기순' }));
  expect(replace).toHaveBeenCalledWith(expect.stringContaining('sortBy=popular'));
  expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
});
