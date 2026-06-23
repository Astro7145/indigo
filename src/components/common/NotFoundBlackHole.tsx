'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';

import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'motion/react';

// 브라우저에서만 안전하게 생성되는 별 데이터
const generateStars = (count = 70) =>
  Array.from({ length: count }, () => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: `${1 + Math.random() * 1.6}px`,
    opacity: 0.25 + Math.random() * 0.55,
    delay: Math.random() * 4,
    duration: 2.4 + Math.random() * 2.6,
  }));

export default function NotFoundBlackHole() {
  const t = useTranslations('notFound');
  const prefersReduce = useReducedMotion();

  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // useReducedMotion은 SSR 안전하지 않으므로 하이드레이션 후에만 반영한다.
  const reduce = hydrated && prefersReduce;

  const stars = hydrated ? generateStars() : [];

  return (
    <main className="bg-indigo-dark-100 relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
      {/* 1. 별 배경 (하이드레이션 완료 후 등장) */}
      {hydrated && (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {stars.map((star, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                opacity: star.opacity,
              }}
              animate={reduce ? undefined : { opacity: [star.opacity * 0.3, star.opacity, star.opacity * 0.3] }}
              transition={{ duration: star.duration, ease: 'easeInOut', repeat: Infinity, delay: star.delay }}
            />
          ))}
        </div>
      )}

      {/* 2. 배경 네뷸라 (서버/클라이언트 모두 즉시 켜짐) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_34%_46%,var(--color-indigo-alpha-30),transparent_58%)]"
      />

      {/* 블랙홀 비주얼 */}
      <div
        aria-hidden
        className="relative flex h-72 w-72 items-center justify-center sm:h-[420px] sm:w-[420px] xl:h-[500px] xl:w-[500px]"
      >
        {/* 화려한 링과 빛 효과: 코어/지평선은 서버에서 '불이 켜진 상태'로 전송되고, 회전 링은 하이드레이션 후 motion으로 돕니다. */}

        {/* 외부 가스 디스크 링1: motion으로 회전 (시간: 20s) */}
        <motion.div
          className="to-indigo-dark-500/10 absolute h-[85%] w-[85%] rounded-full border border-dashed border-indigo-400/20 bg-linear-to-tr from-indigo-500/10 via-transparent blur-xl"
          animate={reduce ? {} : { rotate: 360 }}
          transition={{ duration: 20, ease: 'linear', repeat: Infinity }}
        />

        {/* 외부 가스 디스크 링2: motion으로 반대 회전 (시간: 15s) */}
        <motion.div
          className="absolute h-[75%] w-[75%] rounded-full bg-linear-to-tr from-indigo-500/20 via-transparent to-transparent blur-md"
          animate={reduce ? {} : { rotate: -360 }}
          transition={{ duration: 15, ease: 'linear', repeat: Infinity }}
        />

        {/* 발광 사건의 지평선: 첫 키프레임으로 SSR 렌더 후, 하이드레이션 뒤 opacity·scale 맥동(4s) */}
        <motion.div
          className="absolute h-[52%] w-[52%] rounded-full bg-white shadow-[0_0_50px_20px_rgba(255,255,255,0.8),0_0_100px_40px_rgb(from_var(--color-indigo-500)_r_g_b/0.4)] blur-[1.5px]"
          animate={
            reduce
              ? undefined
              : {
                  opacity: [0.9, 0.5, 0.7, 0.5, 0.9],
                  scale: [1.03, 0.98, 1.0, 0.98, 1.03],
                }
          }
          transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
        />

        {/* 코어 (서버/클라이언트 모두 항상 켜짐) */}
        <div className="absolute h-[50%] w-[50%] rounded-full bg-black shadow-[inset_0_0_25px_#000]" />
      </div>

      {/* 카피 한 줄 + 홈 버튼 (서버/클라이언트 모두 항상 켜짐) */}
      <div className="relative mt-12 flex flex-col items-center gap-6">
        <h1 className="text-base font-medium text-white sm:text-lg">{t('description')}</h1>
        <Link
          href="/"
          className="bg-indigo-dark-700 hover:bg-indigo-dark-600 inline-flex items-center justify-center rounded px-[18px] py-[13px] text-lg font-semibold tracking-[-0.03em] text-white transition-colors select-none"
        >
          {t('home')}
        </Link>
      </div>
    </main>
  );
}
