import { useId } from 'react';

import { cn } from '@/src/utils/cn';

interface MoonphaseProps {
  /**
   * 진행률 0~100. lit(밝은) 영역의 경계(터미네이터)를 `rx = -50 + percent`로 결정.
   * 0=초승달(거의 안 보임) → 50=반달 → 100=보름달(가득 참). 좌측이 밝아지며 차오른다.
   */
  percent: number;
  className?: string;
}

// figma 구체: 반지름 68.75, 중심 (110,110). 공식 rx(-50~50)를 구체 반지름에 맞춰 1.375배 스케일.
const R = 68.75;
const CX = 110;
const TOP = CX - R; // 41.25
const BOTTOM = CX + R; // 178.75
const SCALE = R / 50; // 1.375

function litPathFor(percent: number): string {
  const p = Math.max(0, Math.min(100, percent));
  const rx = (-50 + p) * SCALE; // -68.75 ~ 68.75
  // 좌측 반원(아우터) + 터미네이터 타원호. rx>=0이면 sweep 0(바깥쪽), rx<0이면 sweep 1(안쪽)
  return rx >= 0
    ? `M${CX} ${TOP}A${R} ${R} 0 0 0 ${CX} ${BOTTOM}A${rx} ${R} 0 0 0 ${CX} ${TOP}Z`
    : `M${CX} ${TOP}A${R} ${R} 0 0 0 ${CX} ${BOTTOM}A${-rx} ${R} 0 0 1 ${CX} ${TOP}Z`;
}

/**
 * 달 위상(moonphase) — `percent`에 따라 lit 영역이 차오르는 parametric SVG.
 * 정적 자산이 아니라 percent로 모양이 결정되므로 ProgressCard에서 애니메이션할 수 있다.
 * 인스턴스별 gradient ID 충돌 방지를 위해 `useId()` prefix 사용.
 */
export default function Moonphase({ percent, className }: MoonphaseProps) {
  const uid = useId();
  const idHalo = `${uid}-halo`;
  const idDark = `${uid}-dark`;
  const idLight = `${uid}-light`;

  return (
    <svg
      aria-hidden
      viewBox="0 0 220 220"
      fill="none"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('block', className)}
    >
      {/* halo */}
      <circle cx="110" cy="110" r="110" fill={`url(#${idHalo})`} />
      {/* 어두운 구체(배경) */}
      <circle cx="110" cy="110" r={R} fill={`url(#${idDark})`} />
      {/* 밝은 영역(parametric) */}
      <path d={litPathFor(percent)} fill={`url(#${idLight})`} />
      {/* 표면 음영(crater) — lit 영역 위에 얹혀 자연스러운 질감 */}
      <path
        opacity="0.06"
        d="M85.25 97.625C87.5282 97.625 89.375 95.7782 89.375 93.5C89.375 91.2218 87.5282 89.375 85.25 89.375C82.9718 89.375 81.125 91.2218 81.125 93.5C81.125 95.7782 82.9718 97.625 85.25 97.625Z"
        fill="black"
      />
      <path
        opacity="0.05"
        d="M71.5 123.75C73.0188 123.75 74.25 122.519 74.25 121C74.25 119.481 73.0188 118.25 71.5 118.25C69.9812 118.25 68.75 119.481 68.75 121C68.75 122.519 69.9812 123.75 71.5 123.75Z"
        fill="black"
      />
      <path
        opacity="0.05"
        d="M93.5 138.188C95.3985 138.188 96.9375 136.648 96.9375 134.75C96.9375 132.852 95.3985 131.312 93.5 131.312C91.6015 131.312 90.0625 132.852 90.0625 134.75C90.0625 136.648 91.6015 138.188 93.5 138.188Z"
        fill="black"
      />
      <defs>
        <radialGradient
          id={idHalo}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(110 110) scale(110)"
        >
          <stop offset="0.6" stopColor="#D9CEFF" stopOpacity="0" />
          <stop offset="0.66" stopColor="#D9CEFF" stopOpacity="0.4" />
          <stop offset="1" stopColor="#B3AAFF" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id={idDark}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(137.5 123.75) scale(96.25)"
        >
          <stop stopColor="#3D3677" />
          <stop offset="1" stopColor="#2A2466" />
        </radialGradient>
        <radialGradient
          id={idLight}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(71.775 82.5) scale(96.6625 130.625)"
        >
          <stop stopColor="#FFFAEC" />
          <stop offset="0.5" stopColor="#F0E5F8" />
          <stop offset="1" stopColor="#B8AED9" />
        </radialGradient>
      </defs>
    </svg>
  );
}
