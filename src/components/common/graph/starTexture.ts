import { CanvasTexture } from 'three';

/** 둥근 코어 글로우 + 십자 스파이크(별빛 회절)를 그린 별/글로우 스프라이트 텍스처. */
function createStarTexture(): CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const tex = new CanvasTexture(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return tex;

  const c = size / 2;
  ctx.globalCompositeOperation = 'lighter'; // 겹치는 빛은 더해지도록

  // 둥근 코어 글로우
  const glow = ctx.createRadialGradient(c, c, 0, c, c, c);
  glow.addColorStop(0, 'rgba(255,255,255,1)');
  glow.addColorStop(0.18, 'rgba(255,255,255,0.8)');
  glow.addColorStop(0.45, 'rgba(255,255,255,0.16)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  // 십자 스파이크(가로/세로) — 가운데가 밝고 끝으로 갈수록 사라짐
  const drawSpike = (horizontal: boolean) => {
    const grad = horizontal ? ctx.createLinearGradient(0, c, size, c) : ctx.createLinearGradient(c, 0, c, size);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.85)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    const t = 2.5;
    if (horizontal) ctx.fillRect(0, c - t / 2, size, t);
    else ctx.fillRect(c - t / 2, 0, t, size);
  };
  drawSpike(true);
  drawSpike(false);

  tex.needsUpdate = true;
  return tex;
}

let cached: CanvasTexture | null = null;

/** 별 스프라이트용 글로우 텍스처(클라이언트에서 1회 생성·캐시). */
export function getStarTexture(): CanvasTexture {
  if (!cached) cached = createStarTexture();
  return cached;
}
