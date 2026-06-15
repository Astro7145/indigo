/**
 * 3D 그래프 색 — 값은 globals.css `@theme` 토큰이 단일 출처다(여기에 hex를 직접 박지 않는다).
 * three.js 머티리얼/배경은 `var(...)`를 못 받으므로(WebGL) 런타임에 CSS 변수 값을 읽어 실제 색으로 해석한다.
 * GraphCanvas가 dynamic(ssr:false)라 그래프 트리는 브라우저에서만 렌더되므로 getComputedStyle이 안전하다.
 * DOM 요소(컨테이너 배경 등)는 `var(--color-...)`를 인라인 스타일에 직접 쓰면 된다.
 */
export interface GraphColors {
  background: string;
  moon: string;
  goal: string;
  todo: string;
  note: string;
  link: string;
}

/** globals.css @theme 토큰 이름 매핑. 배경은 가장 어두운 slate, 그 외는 브랜드 indigo 스케일. */
const TOKENS: Record<keyof GraphColors, string> = {
  background: '--color-slate-900',
  moon: '--color-indigo-100',
  goal: '--color-indigo-300',
  todo: '--color-indigo-400',
  note: '--color-indigo-500',
  link: '--color-indigo-800',
};

let cache: GraphColors | null = null;

/** @theme 토큰 값을 런타임에 읽어 해석한다(클라이언트 전용, 1회 캐시). */
export function getGraphColors(): GraphColors {
  if (cache) return cache;
  const style = getComputedStyle(document.documentElement);
  const resolved = {} as GraphColors;
  for (const key of Object.keys(TOKENS) as (keyof GraphColors)[]) {
    resolved[key] = style.getPropertyValue(TOKENS[key]).trim();
  }
  cache = resolved;
  return resolved;
}

/** DOM 요소(컨테이너 배경 등)에서 인라인 스타일로 쓸 배경 토큰 참조. */
export const GRAPH_BACKGROUND_VAR = `var(${TOKENS.background})`;
