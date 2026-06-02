import { render, screen } from '@testing-library/react';

import NoteContent from '@/src/components/note/NoteContent';

it('HTML 본문을 렌더한다', () => {
  render(<NoteContent html="<p>안녕하세요</p>" />);
  expect(screen.getByText('안녕하세요')).toBeInTheDocument();
});

it('스크립트 등 위험 태그를 제거한다', () => {
  const { container } = render(<NoteContent html={'<p>본문</p><script>alert(1)</script>'} />);
  expect(screen.getByText('본문')).toBeInTheDocument();
  expect(container.querySelector('script')).toBeNull();
});
