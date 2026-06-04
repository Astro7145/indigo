import { render, screen } from '@testing-library/react';

import NoteLinkEmbed from '@/src/components/note/NoteLinkEmbed';

it('링크 URL로 iframe과 새 탭 열기 링크를 렌더한다', () => {
  render(<NoteLinkEmbed url="https://example.com/lesson/1" />);
  expect(screen.getByTitle('첨부 링크 미리보기')).toHaveAttribute('src', 'https://example.com/lesson/1');
  const link = screen.getByRole('link', { name: '새 탭에서 열기' });
  expect(link).toHaveAttribute('href', 'https://example.com/lesson/1');
  expect(link).toHaveAttribute('target', '_blank');
});
