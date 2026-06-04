import { fireEvent, render, screen } from '@testing-library/react';

import PostImageAttachment from './PostImageAttachment';

it('src로 이미지를 렌더한다', () => {
  const { container } = render(<PostImageAttachment src="https://example.com/photo.png" onDelete={() => {}} />);

  const img = container.querySelector('img');
  expect(img).toBeInTheDocument();
  expect(img?.getAttribute('src')).toContain('photo.png');
});

it('삭제 버튼 클릭 시 onDelete가 호출된다', () => {
  const onDelete = jest.fn();
  render(<PostImageAttachment src="https://example.com/photo.png" onDelete={onDelete} />);

  fireEvent.click(screen.getByRole('button', { name: '이미지 삭제' }));

  expect(onDelete).toHaveBeenCalledTimes(1);
});
