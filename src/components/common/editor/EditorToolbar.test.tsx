import { render, screen } from '@testing-library/react';

import EditorToolbar from './EditorToolbar';

it('기본 상태에서는 링크와 이미지 버튼이 모두 렌더된다', () => {
  render(<EditorToolbar />);

  expect(screen.getByRole('button', { name: '링크 삽입' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '이미지 삽입' })).toBeInTheDocument();
});

it('showLink=false면 링크 버튼이 렌더되지 않는다', () => {
  render(<EditorToolbar showLink={false} />);

  expect(screen.queryByRole('button', { name: '링크 삽입' })).not.toBeInTheDocument();
});

it('showImageUpload=false면 이미지 버튼이 렌더되지 않는다', () => {
  render(<EditorToolbar showImageUpload={false} />);

  expect(screen.queryByRole('button', { name: '이미지 삽입' })).not.toBeInTheDocument();
});
