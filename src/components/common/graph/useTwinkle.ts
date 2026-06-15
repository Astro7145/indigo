import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { MeshStandardMaterial } from 'three';

/**
 * 머티리얼 emissiveIntensity를 base 주위로 은은히 진동시켜 '별이 깜빡이는' 느낌을 준다.
 * setState 없이 머티리얼을 매 프레임 직접 갱신해(리렌더 0) 가볍게 동작한다.
 * seed로 노드마다 위상을 어긋나게 해 동시에 깜빡이지 않도록 한다.
 *
 * 반환한 ref를 `<meshStandardMaterial ref={...} />`에 연결한다. base는 hover 등으로
 * 매 렌더 바뀔 수 있으며(useFrame 콜백이 매 렌더 최신 base로 재구독됨) 그대로 반영된다.
 */
export function useTwinkle(base: number, seed: number, amplitude = 0.35, speed = 1.6) {
  const ref = useRef<MeshStandardMaterial>(null);
  useFrame((state) => {
    const mat = ref.current;
    if (!mat) return;
    mat.emissiveIntensity = base + amplitude * (0.5 + 0.5 * Math.sin(state.clock.elapsedTime * speed + seed));
  });
  return ref;
}
