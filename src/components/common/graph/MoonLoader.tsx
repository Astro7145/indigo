'use client';

import { useEffect, useState } from 'react';
import Moonphase from '@/src/components/common/icons/Moonphase';
import { cn } from '@/src/utils/cn';

/**
 * 로딩 인디케이터 — 달이 차올랐다 기우는 위상 애니메이션(텍스트 대신).
 * Moonphase의 percent(0=초승달 → 100=보름달)를 삼각파로 오가며 끊김 없이 반복한다.
 */
export default function MoonLoader({ className }: { className?: string }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 40);
    return () => clearInterval(id);
  }, []);

  // 삼각파: 0 → 100 → 0 반복(차오름/기욺이 자연스럽게 이어짐)
  const percent = 100 - Math.abs(((tick * 8) % 200) - 100);

  return (
    <span role="status" aria-label="우주를 그리는 중" className="inline-block">
      <Moonphase percent={percent} className={cn('size-20', className)} />
    </span>
  );
}
