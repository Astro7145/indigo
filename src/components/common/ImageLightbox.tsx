'use client';

import { useState } from 'react';

import IconButton from '@/src/components/common/buttons/IconButton';
import { IcDelete } from '@/src/components/common/icons/IcDelete';

interface ImageLightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

export default function ImageLightbox({ src, alt = '', onClose }: ImageLightboxProps) {
  const [zoomed, setZoomed] = useState(false);
  // raw img는 다운로드 전 0×0이라 그대로 두면 마운트 직후 자연 크기로 layout shift가 일어나 "접혔다 펴지는" 인상을 준다.
  // 로드 완료 전에는 opacity 0으로 감추고, onLoad 시점에 fade-in 시킨다.
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      data-testid="image-lightbox-backdrop"
      // 이미지 외 영역(배경) 클릭만 닫기 — 이미지 자체 클릭은 e.target ≠ e.currentTarget이라 통과
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 flex h-full w-full items-center justify-center bg-black/95"
    >
      {/* raw <img> 사용: next/image fill은 wrapper가 viewport 90%를 차지하고 img가 wrapper 전체를 덮어서 */}
      {/* 사용자가 이미지 옆 검은 영역을 클릭해도 e.target=img가 되어 backdrop 닫기 가드에 안 걸리는 문제가 있다. */}
      {/* raw img는 자연 비율로 표시되어 이미지 외 영역이 그대로 backdrop이 되므로 닫기 UX가 자연스럽다. */}
      {/* 라이트박스는 원본을 그대로 보여주는 게 목적이라 next/image의 자동 최적화 가치도 작다. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onClick={() => setZoomed((z) => !z)}
        className={`max-h-[90vh] max-w-[90vw] object-contain ${zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
        style={{
          touchAction: 'pinch-zoom',
          transform: zoomed ? 'scale(2)' : 'scale(1)',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 200ms ease-out, transform 200ms ease-out',
        }}
      />
      <IconButton aria-label="닫기" onClick={onClose} className="absolute top-4 right-4">
        <IcDelete className="size-6 text-white" />
      </IconButton>
    </div>
  );
}
