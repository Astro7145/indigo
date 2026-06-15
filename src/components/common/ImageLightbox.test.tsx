import { fireEvent, render, screen } from '@testing-library/react';

import ImageLightbox from '@/src/components/common/ImageLightbox';

// jsdom의 PointerEvent는 init의 clientX/Y/pointerId를 인스턴스에 옮겨 담지 않아 핸들러에서 NaN이 된다.
// testing-library의 fireEvent.pointer* 호출이 의미를 갖도록 MouseEvent 기반으로 좁은 polyfill을 둔다.
class PointerEventStub extends MouseEvent {
  pointerId: number;
  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerId = init.pointerId ?? 0;
  }
}
// @ts-expect-error jsdom 한계 우회 — 테스트 한정
window.PointerEvent = PointerEventStub;
// setPointerCapture/release도 jsdom 미구현. no-op 처리해 핸들러 호출이 throw하지 않게.
if (!Element.prototype.setPointerCapture) Element.prototype.setPointerCapture = () => {};
if (!Element.prototype.releasePointerCapture) Element.prototype.releasePointerCapture = () => {};

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

it('이미지 클릭 시 scale이 1 → 2 → 4 → 1로 순환된다', () => {
  render(<ImageLightbox src="https://example.com/a.png" alt="이미지" onClose={() => {}} />);
  const img = screen.getByAltText('이미지');
  expect(img.style.transform).toBe('translate(0px, 0px) scale(1)');
  fireEvent.click(img);
  expect(img.style.transform).toBe('translate(0px, 0px) scale(2)');
  fireEvent.click(img);
  expect(img.style.transform).toBe('translate(0px, 0px) scale(4)');
  fireEvent.click(img);
  expect(img.style.transform).toBe('translate(0px, 0px) scale(1)');
});

it('줌인 상태에서 pointer 드래그 시 transform의 translate가 이동량만큼 변한다', () => {
  render(<ImageLightbox src="https://example.com/a.png" alt="이미지" onClose={() => {}} />);
  const img = screen.getByAltText('이미지');
  fireEvent.click(img); // 줌인
  fireEvent.pointerDown(img, { pointerId: 1, clientX: 100, clientY: 100 });
  fireEvent.pointerMove(img, { pointerId: 1, clientX: 150, clientY: 130 });
  expect(img.style.transform).toBe('translate(50px, 30px) scale(2)');
});

it('줌 아웃 상태에서 드래그하면 translate가 변하지 않는다', () => {
  render(<ImageLightbox src="https://example.com/a.png" alt="이미지" onClose={() => {}} />);
  const img = screen.getByAltText('이미지');
  fireEvent.pointerDown(img, { pointerId: 1, clientX: 100, clientY: 100 });
  fireEvent.pointerMove(img, { pointerId: 1, clientX: 200, clientY: 200 });
  expect(img.style.transform).toBe('translate(0px, 0px) scale(1)');
});

it('드래그 직후의 click은 줌 토글로 잡히지 않는다', () => {
  render(<ImageLightbox src="https://example.com/a.png" alt="이미지" onClose={() => {}} />);
  const img = screen.getByAltText('이미지');
  fireEvent.click(img); // 줌인
  fireEvent.pointerDown(img, { pointerId: 1, clientX: 100, clientY: 100 });
  fireEvent.pointerMove(img, { pointerId: 1, clientX: 200, clientY: 200 });
  fireEvent.pointerUp(img, { pointerId: 1, clientX: 200, clientY: 200 });
  fireEvent.click(img); // pointerUp 직후 click — 드래그였으니 무시
  expect(img.style.transform).toContain('scale(2)'); // 줌아웃 안 됨
});
