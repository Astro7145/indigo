'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

import IconButton from '@/src/components/common/buttons/IconButton';
import { IcDelete } from '@/src/components/common/icons/IcDelete';

interface ImageLightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

// 드래그로 인식할 최소 이동 거리(px). 이 이하의 미세 흔들림은 클릭으로 본다 — 줌 토글 클릭이 드래그에 안 잡혀야 한다.
const DRAG_THRESHOLD_PX = 5;

// 줌 단계 사이클 — 클릭마다 다음 단계로, 마지막 다음은 다시 1x. 디테일(4x)까지 들어갔다가 한 번 더 클릭으로 리셋.
const ZOOM_LEVELS = [1, 2, 4] as const;
type ZoomLevel = (typeof ZOOM_LEVELS)[number];

export default function ImageLightbox({ src, alt = '', onClose }: ImageLightboxProps) {
  const tCommon = useTranslations('common');
  const [scale, setScale] = useState<ZoomLevel>(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  // raw img는 다운로드 전 0×0이라 그대로 두면 마운트 직후 자연 크기로 layout shift가 일어나 "접혔다 펴지는" 인상을 준다.
  // 로드 완료 전에는 opacity 0으로 감추고, onLoad 시점에 fade-in 시킨다.
  const [loaded, setLoaded] = useState(false);
  // cursor·transition 분기에 쓰는 상태. dragStart ref와는 별개로 render에서 안전하게 읽기 위한 state.
  const [dragging, setDragging] = useState(false);
  // 드래그 시작 위치 + 시작 시점 pan 값. ref로 두어 setState 리렌더 없이 즉시 갱신.
  const dragStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  // pointerUp 직후의 click이 줌 토글로 잡히는 false-positive를 막기 위한 1회용 가드.
  const skipNextClick = useRef(false);

  const handleClick = () => {
    if (skipNextClick.current) {
      skipNextClick.current = false;
      return;
    }
    setScale((s) => {
      const next = ZOOM_LEVELS[(ZOOM_LEVELS.indexOf(s) + 1) % ZOOM_LEVELS.length];
      // 사이클이 1x로 돌아갈 때 pan을 0으로 리셋해 다음 줌인 때 가운데에서 시작
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLImageElement>) => {
    // 이전 드래그가 click 없이 끝났을 수 있어(예: pointercancel) skipNextClick이 stuck되면 다음 정상 클릭 1회를 잘못 무시한다. 매 down에서 리셋.
    skipNextClick.current = false;
    if (scale === 1) return;
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!dragStart.current) return;
    setPan({
      x: dragStart.current.panX + (e.clientX - dragStart.current.x),
      y: dragStart.current.panY + (e.clientY - dragStart.current.y),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLImageElement>) => {
    if (dragStart.current) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      if (Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) skipNextClick.current = true;
    }
    dragStart.current = null;
    setDragging(false);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

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
        role="button"
        tabIndex={0}
        onLoad={() => setLoaded(true)}
        onClick={handleClick}
        onKeyDown={(e) => {
          // 키보드 사용자가 Enter/Space로 줌 토글할 수 있게 — img는 native 인터랙티브가 아니므로 명시
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        // 모바일에서 시스템 제스처·알림 등으로 pointerCancel이 발생해도 dragging 상태가 stuck되지 않도록 pointerUp 흐름과 동일 처리
        onPointerCancel={handlePointerUp}
        className="max-h-[90vh] max-w-[90vw] object-contain"
        style={{
          // native pinch는 viewport 전체를 zoom해 뒤 페이지·모달 셸까지 같이 확대되므로 모든 상태에서 끄고 우리 사이클·드래그 팬으로만 처리한다.
          touchAction: 'none',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          opacity: loaded ? 1 : 0,
          // 드래그 중에는 transform transition을 끄고 손가락을 즉시 따라가게 한다 — transition 켜져 있으면 끌리는 느낌
          transition: dragging ? 'opacity 200ms ease-out' : 'opacity 200ms ease-out, transform 200ms ease-out',
          cursor: scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in',
        }}
      />
      <IconButton aria-label={tCommon('actions.close')} onClick={onClose} className="absolute top-4 right-4">
        <IcDelete className="size-6 text-white" />
      </IconButton>
    </div>
  );
}
