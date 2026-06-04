import { useId } from 'react';

/**
 * "노트 모아보기" 카드의 노트북 일러스트 — Figma `node 21209:54563` ("Group 33970").
 * 원본은 청록 컬러이며, 보라 그라데이션 카드 위에서 `mix-blend-luminosity`(소비 측에서 지정)로
 * 회색조로 녹아든다. GoalNotesCard에서 사용.
 *
 * 인스턴스가 여러 번 렌더돼도 gradient ID가 충돌하지 않도록 `useId()`로 prefix를 부여한다.
 */
export default function NotesIllustration({ className }: { className?: string }) {
  const uid = useId();
  const g = (i: number) => `${uid}-p${i}`;

  return (
    <svg viewBox="0 0 97.714 96.9459" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className={className}>
      <path
        d="M0 15.0766C0 10.6584 3.58172 7.07664 8 7.07664L51.3405 7.07664C55.7587 7.07664 59.3405 10.6584 59.3405 15.0766L59.3405 71.5535C59.3405 75.9718 55.7587 79.5535 51.3405 79.5535H8C3.58172 79.5535 0 75.9718 0 71.5535L0 15.0766Z"
        fill={`url(#${g(0)})`}
      />
      <path
        d="M0 15.0766C0 10.6584 3.58172 7.07664 8 7.07664L51.3405 7.07664C55.7587 7.07664 59.3405 10.6584 59.3405 15.0766V23.8369L0 23.8369L0 15.0766Z"
        fill={`url(#${g(1)})`}
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
        fill={`url(#${g(2)})`}
      />
      <rect
        x="31.6934"
        y="0.485629"
        width="12.2305"
        height="3.17086"
        rx="1.58543"
        transform="rotate(90 31.6934 0.485629)"
        fill={`url(#${g(3)})`}
      />
      <rect
        x="47.5079"
        y="9.12776e-08"
        width="12.2305"
        height="3.17086"
        rx="1.58543"
        transform="rotate(90 47.5079 9.12776e-08)"
        fill={`url(#${g(4)})`}
      />
      <path
        d="M85.1916 94.9459V44.2058C85.1916 43.0948 84.286 42.1966 83.1749 42.2059L54.1751 42.448C53.642 42.4525 53.1327 42.6696 52.7604 43.0511L41.4733 54.6173C41.1152 54.9842 40.9117 55.4747 40.9049 55.9875L40.3865 94.9193C40.3716 96.0341 41.2713 96.9459 42.3863 96.9459H83.1916C84.2962 96.9459 85.1916 96.0505 85.1916 94.9459Z"
        fill={`url(#${g(5)})`}
      />
      <path
        d="M94.3024 39.5938C94.6929 39.2033 95.3261 39.2033 95.7166 39.5938L97.0069 40.8841C97.3974 41.2746 97.3974 41.9078 97.0069 42.2983L78.9187 60.3865C78.8287 60.4765 78.7224 60.5484 78.6055 60.5986L76.3475 61.5663C75.5177 61.9219 74.6788 61.0829 75.0344 60.2532L76.0021 57.9952C76.0522 57.8783 76.1242 57.772 76.2141 57.682L94.3024 39.5938Z"
        fill="#2D5364"
      />
      <path d="M54.5575 55.8969L53.5771 42.242L40.9025 54.9165L54.5575 55.8969Z" fill={`url(#${g(6)})`} />
      <defs>
        <linearGradient id={g(0)} x1="29.6702" y1="7.07664" x2="29.6702" y2="79.5535" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8CE6E3" />
          <stop offset="1" stopColor="#68D8CD" />
        </linearGradient>
        <linearGradient id={g(1)} x1="0" y1="15.4568" x2="59.3405" y2="15.4568" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" />
          <stop offset="1" stopColor="#E1F7FA" />
        </linearGradient>
        <linearGradient id={g(2)} x1="15.9971" y1="2.99412" x2="28.2275" y2="2.99412" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ABCCCE" />
          <stop offset="1" stopColor="#8FB0B2" />
        </linearGradient>
        <linearGradient id={g(3)} x1="31.6934" y1="2.07106" x2="43.9239" y2="2.07106" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ABCCCE" />
          <stop offset="1" stopColor="#8FB0B2" />
        </linearGradient>
        <linearGradient id={g(4)} x1="47.5079" y1="1.58543" x2="59.7384" y2="1.58543" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ABCCCE" />
          <stop offset="1" stopColor="#8FB0B2" />
        </linearGradient>
        <linearGradient id={g(5)} x1="66.0369" y1="42.0406" x2="62.7741" y2="96.9464" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A7A7A7" />
          <stop offset="1" stopColor="#E5E5E5" />
        </linearGradient>
        <linearGradient id={g(6)} x1="44.8006" y1="46.14" x2="54.5575" y2="55.8969" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" />
          <stop offset="1" stopColor="#F4FCFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}
