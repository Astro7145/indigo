import { render, screen, fireEvent } from '@testing-library/react';

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

it('인기순 선택 시 셀렉터 라벨이 인기순으로 바뀌고 드롭다운이 닫힌다', () => {
  render(<PostSearchBar />);
  fireEvent.click(screen.getByRole('button', { name: /최신순/ }));
  fireEvent.click(screen.getByRole('menuitem', { name: '인기순' }));
  expect(screen.getByRole('button', { name: /인기순/ })).toBeInTheDocument();
  expect(screen.queryByRole('menuitem', { name: '최신순' })).not.toBeInTheDocument();
});
