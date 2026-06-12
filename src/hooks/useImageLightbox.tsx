'use client';

import ImageLightbox from '@/src/components/common/ImageLightbox';
import { useModalStore } from '@/src/stores/modal';

// 공용 Modal 셸의 기본 width/padding/배경/shadow를 풀스크린 라이트박스 컨텍스트에 맞게 모두 무효화.
// 'fullscreen' 같은 별도 variant를 도입하는 대신 className override로 처리한다 — 모달 인프라 변경 최소화.
const LIGHTBOX_OVERRIDE_CLASSNAME =
  'bg-transparent shadow-none rounded-none p-0 max-w-none max-h-none w-screen overflow-visible';

// 게시판·할일 등 어느 모달 위에서도 호출 가능. variant는 항상 'modal' 고정 ('auto'면 모바일에서 bottom-sheet로 잘못 해석됨).
export function useImageLightbox() {
  const open = useModalStore((s) => s.open);
  return (src: string, alt?: string) => {
    open((controls) => <ImageLightbox src={src} alt={alt} onClose={controls.close} />, {
      variant: 'modal',
      className: LIGHTBOX_OVERRIDE_CLASSNAME,
    });
  };
}
