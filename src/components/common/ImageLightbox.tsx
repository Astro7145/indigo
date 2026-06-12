'use client';

import Image from 'next/image';
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

  return (
    <div
      data-testid="image-lightbox-backdrop"
      // 이미지 외 영역(배경) 클릭만 닫기 — 이미지 영역(wrapper) 클릭은 e.target ≠ e.currentTarget이라 통과
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 flex h-full w-full items-center justify-center bg-black/95"
    >
      {/* fill 모드는 부모가 relative + 명확한 크기를 가져야 동작 — viewport 90% 영역으로 고정 */}
      <div className="relative h-[90vh] w-[90vw]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="90vw"
          onDoubleClick={() => setZoomed((z) => !z)}
          className={`object-contain transition-transform duration-200 ${zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
          style={{ touchAction: 'pinch-zoom', transform: zoomed ? 'scale(2)' : 'scale(1)' }}
        />
      </div>
      <IconButton aria-label="닫기" onClick={onClose} className="absolute top-4 right-4">
        <IcDelete className="size-6 text-white" />
      </IconButton>
    </div>
  );
}
