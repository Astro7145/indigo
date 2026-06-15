/**
 * 3D 그래프 색 — three.js 머티리얼/배경은 Tailwind 토큰 유틸을 쓸 수 없어(WebGL),
 * globals.css `@theme` 의 indigo 스케일 값을 여기서 리터럴로 단일 정의해 매핑한다.
 */
export const GRAPH_COLORS = {
  background: '#161b4b', // indigo-900
  moon: '#faf7ff', // indigo-100
  moonGlow: '#d9ceff', // indigo-400
  goal: '#b3aaff', // indigo-500
  todo: '#d9ceff', // indigo-400
  todoDone: '#6a65b4', // indigo-700
  note: '#8e86d9', // indigo-600
  link: '#464590', // indigo-800
} as const;
