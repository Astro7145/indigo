'use client';

import { useRouter } from 'next/navigation';

import Card from '@/src/components/common/cards/Card';
import { IcChevron } from '@/src/components/common/icons/IcChevron';
import { cn } from '@/src/utils/cn';

export interface GoalNotesCardProps {
  goalId: number;
  className?: string;
}

// 인접한 ProgressCard(목표 진행도)와 시각적으로 동일하도록 같은 그라데이션을 재사용한다
// (ProgressCard 구현이 쓰는 값과 동일 — figma의 두 카드는 같은 그라데이션).
const GRADIENT = 'bg-[linear-gradient(120deg,#6E66C8_0%,#3D3677_73.21%)]';

/**
 * Figma 노트 모아보기 카드의 노트북 일러스트 (21209:54563, "Group 33970")를 그대로 가져온 SVG.
 * 원본 청록 컬러 위에 `mix-blend-luminosity` + opacity로 보라 그라데이션에 회색조로 녹아든다.
 */
function NoteCollectIllust({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 97.714 96.9459" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className={className}>
      <path
        d="M0 15.0766C0 10.6584 3.58172 7.07664 8 7.07664L51.3405 7.07664C55.7587 7.07664 59.3405 10.6584 59.3405 15.0766L59.3405 71.5535C59.3405 75.9718 55.7587 79.5535 51.3405 79.5535H8C3.58172 79.5535 0 75.9718 0 71.5535L0 15.0766Z"
        fill="url(#ncPaint0)"
      />
      <path
        d="M0 15.0766C0 10.6584 3.58172 7.07664 8 7.07664L51.3405 7.07664C55.7587 7.07664 59.3405 10.6584 59.3405 15.0766V23.8369L0 23.8369L0 15.0766Z"
        fill="url(#ncPaint1)"
      />
      <circle cx="14.2909" cy="12.9749" r="2.94437" transform="rotate(-15 14.2909 12.9749)" fill="#D9D9D9" />
      <circle cx="30.2208" cy="12.9275" r="2.94437" transform="rotate(-15 30.2208 12.9275)" fill="#D9D9D9" />
      <circle cx="46.0351" cy="12.4409" r="2.94437" transform="rotate(-15 46.0351 12.4409)" fill="#D9D9D9" />
      <rect x="9.96285" y="33.3503" width="39.4093" height="4.07683" rx="2.03841" fill="#0E959D" />
      <rect x="9.96333" y="46.9392" width="39.4093" height="3.62384" rx="1.81192" fill="#0E959D" />
      <rect x="9.96484" y="60.0754" width="39.4093" height="3.62384" rx="1.81192" fill="#0E959D" />
      <rect
        x="15.9971"
        y="1.40869"
        width="12.2305"
        height="3.17086"
        rx="1.58543"
        transform="rotate(90 15.9971 1.40869)"
        fill="url(#ncPaint2)"
      />
      <rect
        x="31.6934"
        y="0.485629"
        width="12.2305"
        height="3.17086"
        rx="1.58543"
        transform="rotate(90 31.6934 0.485629)"
        fill="url(#ncPaint3)"
      />
      <rect
        x="47.5079"
        y="9.12776e-08"
        width="12.2305"
        height="3.17086"
        rx="1.58543"
        transform="rotate(90 47.5079 9.12776e-08)"
        fill="url(#ncPaint4)"
      />
      <path
        d="M85.1916 94.9459V44.2058C85.1916 43.0948 84.286 42.1966 83.1749 42.2059L54.1751 42.448C53.642 42.4525 53.1327 42.6696 52.7604 43.0511L41.4733 54.6173C41.1152 54.9842 40.9117 55.4747 40.9049 55.9875L40.3865 94.9193C40.3716 96.0341 41.2713 96.9459 42.3863 96.9459H83.1916C84.2962 96.9459 85.1916 96.0505 85.1916 94.9459Z"
        fill="url(#ncPaint5)"
      />
      <path
        d="M94.3024 39.5938C94.6929 39.2033 95.3261 39.2033 95.7166 39.5938L97.0069 40.8841C97.3974 41.2746 97.3974 41.9078 97.0069 42.2983L78.9187 60.3865C78.8287 60.4765 78.7224 60.5484 78.6055 60.5986L76.3475 61.5663C75.5177 61.9219 74.6788 61.0829 75.0344 60.2532L76.0021 57.9952C76.0522 57.8783 76.1242 57.772 76.2141 57.682L94.3024 39.5938Z"
        fill="#2D5364"
      />
      <path d="M54.5575 55.8969L53.5771 42.242L40.9025 54.9165L54.5575 55.8969Z" fill="url(#ncPaint6)" />
      <defs>
        <linearGradient
          id="ncPaint0"
          x1="29.6702"
          y1="7.07664"
          x2="29.6702"
          y2="79.5535"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8CE6E3" />
          <stop offset="1" stopColor="#68D8CD" />
        </linearGradient>
        <linearGradient id="ncPaint1" x1="0" y1="15.4568" x2="59.3405" y2="15.4568" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" />
          <stop offset="1" stopColor="#E1F7FA" />
        </linearGradient>
        <linearGradient
          id="ncPaint2"
          x1="15.9971"
          y1="2.99412"
          x2="28.2275"
          y2="2.99412"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ABCCCE" />
          <stop offset="1" stopColor="#8FB0B2" />
        </linearGradient>
        <linearGradient
          id="ncPaint3"
          x1="31.6934"
          y1="2.07106"
          x2="43.9239"
          y2="2.07106"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ABCCCE" />
          <stop offset="1" stopColor="#8FB0B2" />
        </linearGradient>
        <linearGradient
          id="ncPaint4"
          x1="47.5079"
          y1="1.58543"
          x2="59.7384"
          y2="1.58543"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ABCCCE" />
          <stop offset="1" stopColor="#8FB0B2" />
        </linearGradient>
        <linearGradient
          id="ncPaint5"
          x1="66.0369"
          y1="42.0406"
          x2="62.7741"
          y2="96.9464"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#A7A7A7" />
          <stop offset="1" stopColor="#E5E5E5" />
        </linearGradient>
        <linearGradient id="ncPaint6" x1="44.8006" y1="46.14" x2="54.5575" y2="55.8969" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" />
          <stop offset="1" stopColor="#F4FCFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * "노트 모아보기" 카드 — 클릭 시 해당 목표에 속한 할 일들의 노트 모아보기 페이지로 이동한다.
 *
 * Figma 21209:54557 (308×160). 그라데이션 + 노트북 일러스트(시안 SVG 그대로) + 안내 텍스트.
 * 이동 대상 페이지(`/goals/[goalId]/notes`)는 별도 작업으로, 이 카드는 진입점만 담당한다.
 */
export default function GoalNotesCard({ goalId, className }: GoalNotesCardProps) {
  const router = useRouter();
  return (
    <Card
      onClick={() => router.push(`/goals/${goalId}/notes`)}
      className={cn(
        'relative h-40 overflow-hidden border-0 p-0 text-white shadow-[0_8px_12px_0_rgba(61,54,119,0.25)] transition-shadow hover:shadow-[0_12px_20px_0_rgba(61,54,119,0.35)]',
        GRADIENT,
        className,
      )}
    >
      {/* figma overlay — 본체 위 미세한 하단 어둠 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/[0.07]"
      />
      {/* 노트북 일러스트 — figma처럼 우측에 15° 기울여 배치, luminosity로 그라데이션에 녹임 */}
      <NoteCollectIllust className="pointer-events-none absolute top-[15px] right-1 size-[119px] rotate-[15deg] opacity-70 mix-blend-luminosity" />
      {/* 안내 텍스트 + 우측 chevron */}
      <div className="absolute bottom-[35px] left-10 flex items-center gap-0.5">
        <span className="text-2xl font-bold tracking-[-0.03em]">노트 모아보기</span>
        <IcChevron aria-hidden direction="right" className="size-6 text-white" />
      </div>
    </Card>
  );
}
