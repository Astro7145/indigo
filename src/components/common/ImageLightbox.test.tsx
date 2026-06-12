import { fireEvent, render, screen } from '@testing-library/react';

import ImageLightbox from '@/src/components/common/ImageLightbox';

it('alt를 가진 이미지가 렌더된다', () => {
  render(<ImageLightbox src="https://example.com/a.png" alt="첨부 이미지" onClose={() => {}} />);
  // next/image가 src를 /_next/image?url=... 로 변환하므로 src 직접 비교는 깨짐 — 렌더 + alt만 확인
  expect(screen.getByAltText('첨부 이미지')).toBeInTheDocument();
});

it('닫기 버튼 클릭 시 onClose가 호출된다', () => {
  const onClose = jest.fn();
  render(<ImageLightbox src="https://example.com/a.png" onClose={onClose} />);
  fireEvent.click(screen.getByRole('button', { name: '닫기' }));
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('배경(이미지 외 영역) 클릭 시 onClose가 호출된다', () => {
  const onClose = jest.fn();
  render(<ImageLightbox src="https://example.com/a.png" alt="이미지" onClose={onClose} />);
  fireEvent.click(screen.getByTestId('image-lightbox-backdrop'));
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('이미지 자체 클릭으로는 onClose가 호출되지 않는다', () => {
  const onClose = jest.fn();
  render(<ImageLightbox src="https://example.com/a.png" alt="이미지" onClose={onClose} />);
  fireEvent.click(screen.getByAltText('이미지'));
  expect(onClose).not.toHaveBeenCalled();
});

it('이미지 클릭 시 scale이 1x ↔ 2x로 토글된다', () => {
  render(<ImageLightbox src="https://example.com/a.png" alt="이미지" onClose={() => {}} />);
  const img = screen.getByAltText('이미지');
  expect(img.style.transform).toBe('scale(1)');
  fireEvent.click(img);
  expect(img.style.transform).toBe('scale(2)');
  fireEvent.click(img);
  expect(img.style.transform).toBe('scale(1)');
});
